/**
 * Session engine — refresh rotation, logout orchestration and cross-tab
 * synchronization (FE-008 / EF-25).
 *
 * Contract (Integration Handbook §3):
 *  - `POST /login-api/refresh` with `{ refreshToken }`; single-use rotation —
 *    replaying a rotated token revokes the whole family.
 *  - HTTP 429 with `Retry-After` (delta-seconds or HTTP-date) is a throttle,
 *    NOT an auth failure: tokens are preserved and no retry happens early.
 *  - An ambiguous network failure during refresh must be treated as an
 *    expired session — never retried blindly (Handbook §3.3).
 *  - `POST /login-api/logout` is idempotent and best-effort; local cleanup
 *    and redirect always happen.
 *
 * Architecture invariants:
 *  - `setAuthPair()` is the ONLY logical writer of token material;
 *    `clearAuth()` (via the store) is the only wiper.
 *  - A monotonic `sessionGeneration` guards every write: a refresh that
 *    started under generation N can never write after logout or after a
 *    newer login (generation N+1).
 *  - This module never imports `api`/`authService` — it owns a bare fetch
 *    for the public auth endpoints (keeps the dependency graph acyclic and
 *    keeps refresh calls out of the 401 interceptor).
 */
import { API_BASE_URL } from '../config/env';
import logger from '../utils/logger';
import { useAuthStore, getRefreshToken, type AuthState } from '../store/authStore';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const REFRESH_ENDPOINT = `${API_BASE_URL}/login-api/refresh`;
const LOGOUT_ENDPOINT = `${API_BASE_URL}/login-api/logout`;
const AUTH_CHANNEL_NAME = 'edunest_auth_sync';
const REFRESH_LOCK_NAME = 'edunest_auth_refresh_lock';
/** Max time logout waits for an in-flight refresh to settle (RL-2). */
const LOGOUT_WAIT_CAP = 5000;
/** Max time the best-effort revocation call may take (RL-5). */
const LOGOUT_API_TIMEOUT = 3000;
/** Retry-After fallback when the header is missing/unparseable (RA-3). */
const RETRY_AFTER_FALLBACK_MS = 30000;
/** Cap on tracked BroadcastChannel senders (LRU eviction, MEM-1). */
const MAX_TRACKED_SENDERS = 32;

/* ------------------------------------------------------------------ */
/* Session generation                                                  */
/* ------------------------------------------------------------------ */

let generationCounter = 0;
let activeGeneration: number | null = null;
let generationActive = false;
let loggingOut = false;

/** A login (or a restored session) opens a new, monotonically increasing generation. */
export function startSession(): void {
  activeGeneration = ++generationCounter;
  generationActive = true;
  loggingOut = false;
  // A brand-new session starts with a clean throttle lease: a 429 that
  // belonged to the previous generation must not block this one.
  refreshNotBefore = 0;
}

/** Logout invalidates the current generation. The counter itself never resets. */
export function invalidateSession(): void {
  generationActive = false;
  loggingOut = true;
}

/* ------------------------------------------------------------------ */
/* Single write boundary                                               */
/* ------------------------------------------------------------------ */

export interface AuthPairPayload {
  token: string;
  refreshToken?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userAvatar?: string;
  rememberMe?: boolean;
  lastEmail?: string;
}

/**
 * The ONLY logical writer of token material.
 *
 * A write is permitted only while the session generation captured by the
 * caller is still the active one and no logout is in progress. A refresh
 * that started before a logout (or before a newer login) therefore can
 * never write its pair (EP-1 / GEN-1..4).
 *
 * @returns true when the pair was written, false when it was discarded.
 */
export function setAuthPair(payload: AuthPairPayload, sourceGeneration?: number): boolean {
  if (loggingOut || !generationActive) return false;
  if (sourceGeneration !== undefined && sourceGeneration !== activeGeneration) return false;
  useAuthStore.getState().setAuth(payload);
  return true;
}

/**
 * Login entry point — opens a new generation and writes the pair in a
 * single state update so the storage adapter routes it to the correct home
 * immediately (rememberMe is part of the same write).
 */
export function completeLogin(payload: AuthPairPayload): void {
  startSession();
  setAuthPair(payload);
}

/* ------------------------------------------------------------------ */
/* BroadcastChannel — notification-only cross-tab sync                 */
/* ------------------------------------------------------------------ */

type ChannelMessageType = 'TOKEN_REFRESHED' | 'LOGOUT';

interface ChannelMessage {
  type: ChannelMessageType;
  senderId: string;
  seq: number;
}

let channel: BroadcastChannel | null = null;
let senderId = '';
let localSeq = 0;
const lastSeqBySender = new Map<string, { seq: number; lastSeenAt: number }>();

function generateSenderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sid-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function broadcast(type: ChannelMessageType): void {
  localSeq += 1;
  channel?.postMessage({ type, senderId, seq: localSeq } satisfies ChannelMessage);
}

/** Per-sender monotonic de-duplication with bounded memory (OUT-1..3, MEM-1..2). */
function isDuplicateOrStale(message: ChannelMessage): boolean {
  const tracked = lastSeqBySender.get(message.senderId);
  if (tracked && message.seq <= tracked.seq) return true;

  if (lastSeqBySender.size >= MAX_TRACKED_SENDERS && !tracked) {
    // Evict the least-recently-seen sender.
    let oldestKey: string | null = null;
    let oldestSeen = Infinity;
    for (const [key, value] of lastSeqBySender) {
      if (value.lastSeenAt < oldestSeen) {
        oldestSeen = value.lastSeenAt;
        oldestKey = key;
      }
    }
    if (oldestKey) lastSeqBySender.delete(oldestKey);
  }
  lastSeqBySender.set(message.senderId, { seq: message.seq, lastSeenAt: Date.now() });
  return false;
}

function clearTrackedSenders(): void {
  lastSeqBySender.clear();
}

function handleChannelMessage(event: MessageEvent): void {
  const data = event.data as Partial<ChannelMessage> | null;
  // Strict schema: unknown shapes are ignored silently (BC-3).
  if (
    !data ||
    (data.type !== 'TOKEN_REFRESHED' && data.type !== 'LOGOUT') ||
    typeof data.senderId !== 'string' ||
    typeof data.seq !== 'number' ||
    !Number.isFinite(data.seq)
  ) {
    return;
  }
  if (data.senderId === senderId) return;
  if (isDuplicateOrStale(data as ChannelMessage)) return;

  if (data.type === 'TOKEN_REFRESHED') {
    handlePeerRefresh();
  } else {
    handlePeerLogout();
  }
}

/**
 * A peer tab rotated the pair. In checked (localStorage) mode the message is
 * a NOTIFICATION only — the authoritative pair is re-read from the shared
 * storage and adopted if it differs from ours. Tokens never travel in the
 * message payload.
 */
function handlePeerRefresh(): void {
  if (loggingOut || !generationActive) return;
  const shared = readSharedPair();
  if (!shared?.token) return;
  const current = useAuthStore.getState();
  if (current.token === shared.token) return;
  setAuthPair({
    token: shared.token,
    refreshToken: shared.refreshToken,
    userName: shared.userName,
    userEmail: shared.userEmail,
    userRole: shared.userRole,
  });
}

interface SharedPair {
  token: string;
  refreshToken: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

/**
 * Reads the authoritative pair. In checked mode that is the shared
 * localStorage record (peers write there); in unchecked mode each tab owns
 * its own sessionStorage copy, so the store state is the truth.
 */
function readSharedPair(): SharedPair | null {
  const store = useAuthStore.getState();
  if (!store.rememberMe) {
    return store.token
      ? {
          token: store.token,
          refreshToken: store.refreshToken,
          userName: store.userName,
          userEmail: store.userEmail,
          userRole: store.userRole,
        }
      : null;
  }
  try {
    const raw = window.localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: Partial<AuthState> };
    const state = parsed?.state;
    if (!state?.token) return null;
    return {
      token: state.token,
      refreshToken: state.refreshToken ?? '',
      userName: state.userName ?? '',
      userEmail: state.userEmail ?? '',
      userRole: state.userRole ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Peer logout: local cleanup ALWAYS happens — even on /login or during
 * bootstrap recovery (XT-4). Only the redirect is conditional (loop safety).
 */
function handlePeerLogout(): void {
  invalidateSession();
  currentRefreshAbort?.abort();
  currentRefreshAbort = null;
  clearTrackedSenders();
  useAuthStore.getState().clearAuth(); // sets authInit: 'failed'
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

function initChannel(): void {
  if (typeof BroadcastChannel === 'undefined') return; // same-tab single-flight only
  try {
    senderId = generateSenderId();
    channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    channel.onmessage = handleChannelMessage;
  } catch {
    channel = null;
  }
}

if (typeof window !== 'undefined') {
  initChannel();
}

/* ------------------------------------------------------------------ */
/* Refresh engine                                                      */
/* ------------------------------------------------------------------ */

export type RefreshOutcome =
  | { kind: 'refreshed'; token: string; refreshToken: string }
  | { kind: 'rejected' }    // 401/400 — explicit backend rejection (replayed/expired)
  | { kind: 'throttled' }   // 429 — tokens preserved, wait for Retry-After
  | { kind: 'unavailable' } // no refresh token / logging out / generation inactive
  | { kind: 'ambiguous' };  // network drop or malformed 200 — session ends, never retried

let refreshPromise: Promise<RefreshOutcome> | null = null;
let refreshNotBefore = 0;
let currentRefreshAbort: AbortController | null = null;

/**
 * Parses `Retry-After` (delta-seconds or HTTP-date) into a millisecond
 * delay; falls back to 30s when missing/unparseable (RA-1..3).
 */
export function parseRetryAfter(value: string | null): number {
  if (value) {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10) * 1000;
    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }
  }
  return RETRY_AFTER_FALLBACK_MS;
}

/**
 * Single-flight refresh (T1). Concurrent callers share one in-flight
 * promise; cross-tab mutual exclusion uses the Web Locks API when
 * available, and the latest shared pair is re-read inside the lock.
 */
export function refreshAccessToken(failedAccessToken: string | undefined): Promise<RefreshOutcome> {
  // A refresh is only meaningful for a caller that actually presented an
  // access token; a 401 on an anonymous request must pass through untouched.
  if (!failedAccessToken) return Promise.resolve({ kind: 'unavailable' });
  if (loggingOut || !generationActive) return Promise.resolve({ kind: 'unavailable' });
  if (Date.now() < refreshNotBefore) return Promise.resolve({ kind: 'throttled' });

  const observedRefreshToken = getRefreshToken();
  if (!observedRefreshToken) return Promise.resolve({ kind: 'unavailable' });

  const sourceGeneration: number | undefined = activeGeneration ?? undefined;
  if (refreshPromise) return refreshPromise;

  refreshPromise = runRefresh(observedRefreshToken, sourceGeneration).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function runRefresh(
  observedRefreshToken: string,
  sourceGeneration: number | undefined
): Promise<RefreshOutcome> {
  const acquireLock = navigator.locks?.request?.bind(navigator.locks);
  if (!acquireLock) {
    // Web Locks unavailable: same-tab single-flight only (documented limit).
    return doRefresh(observedRefreshToken, sourceGeneration);
  }
  try {
    return await acquireLock(REFRESH_LOCK_NAME, () => {
      // Inside the lock: re-read the latest shared state. If another tab
      // already rotated, adopt its pair instead of replaying ours.
      const shared = readSharedPair();
      if (!shared?.refreshToken) return Promise.resolve({ kind: 'unavailable' } as RefreshOutcome);
      if (shared.refreshToken !== observedRefreshToken) {
        const adopted = setAuthPair(
          {
            token: shared.token,
            refreshToken: shared.refreshToken,
            userName: shared.userName,
            userEmail: shared.userEmail,
            userRole: shared.userRole,
          },
          undefined
        );
        const adoptedOutcome: RefreshOutcome = adopted
        ? { kind: 'refreshed', token: shared.token, refreshToken: shared.refreshToken }
        : { kind: 'unavailable' };
      return Promise.resolve(adoptedOutcome);
      }
      return doRefresh(shared.refreshToken, sourceGeneration);
    });
  } catch {
    // Lock coordination failed — never rotate without it (fail-safe).
    return { kind: 'unavailable' };
  }
}

async function doRefresh(
  refreshToken: string,
  sourceGeneration: number | undefined
): Promise<RefreshOutcome> {
  const controller = new AbortController();
  currentRefreshAbort = controller;
  try {
    const response = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      // Throttle — NOT an auth failure: preserve tokens, honour Retry-After.
      refreshNotBefore = Date.now() + parseRetryAfter(response.headers.get('Retry-After'));
      return { kind: 'throttled' };
    }

    if (!response.ok) {
      // 401/400: replayed / expired / revoked — explicit backend rejection.
      return { kind: 'rejected' };
    }

    const data = (await response.json().catch(() => null)) as
      | { apiResponse?: { jwt?: unknown; refreshToken?: unknown } }
      | null;
    const jwt = data?.apiResponse?.jwt;
    const nextRefreshToken = data?.apiResponse?.refreshToken;
    if (typeof jwt !== 'string' || !jwt || typeof nextRefreshToken !== 'string' || !nextRefreshToken) {
      // 200 with an unusable body — rotation state is unknowable.
      return { kind: 'ambiguous' };
    }

    const wrote = setAuthPair({ token: jwt, refreshToken: nextRefreshToken }, sourceGeneration);
    if (wrote) broadcast('TOKEN_REFRESHED');
    // The pair is returned even when the write was suppressed (logout began
    // mid-flight): performLogout needs the newest token for revocation.
    return { kind: 'refreshed', token: jwt, refreshToken: nextRefreshToken };
  } catch (error) {
    if (controller.signal.aborted) return { kind: 'unavailable' };
    logger.warn('Refresh request failed', error instanceof Error ? error.message : 'unknown error');
    return { kind: 'ambiguous' };
  } finally {
    if (currentRefreshAbort === controller) currentRefreshAbort = null;
  }
}

/* ------------------------------------------------------------------ */
/* Session end                                                         */
/* ------------------------------------------------------------------ */

/**
 * Authoritative local session end (refresh rejected/ambiguous). Local
 * cleanup is unconditional; the redirect is loop-safe. Tokens are never
 * logged and never placed in URLs.
 */
export function endSession(reason: string): void {
  if (loggingOut) return;
  invalidateSession();
  broadcast('LOGOUT');
  currentRefreshAbort?.abort();
  currentRefreshAbort = null;
  clearTrackedSenders();
  useAuthStore.getState().clearAuth();
  logger.warn('Session ended', reason);
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

/**
 * User-initiated logout (RL-1..6):
 *  1. invalidate the generation + block further writes/refreshes
 *  2. broadcast LOGOUT so peers clear immediately
 *  3. wait (bounded) for an in-flight refresh so the NEWEST token is used
 *     for revocation — its write is suppressed by the generation guard
 *  4. best-effort `POST /login-api/logout` (idempotent, 3s cap)
 *  5. ALWAYS: local cleanup + redirect, independent of steps 3-4 outcomes
 *
 * `serverRevocation` is only 'confirmed' on a 2xx response — never claimed
 * otherwise (LG-1).
 */
export async function performLogout(): Promise<void> {
  if (loggingOut) return;
  invalidateSession();
  broadcast('LOGOUT');

  // Bounded wait for an in-flight refresh (its storage write is suppressed).
  const inFlight = refreshPromise;
  let revocationToken = getRefreshToken();
  if (inFlight) {
    const settled = await Promise.race([
      inFlight.catch(() => null),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), LOGOUT_WAIT_CAP)),
    ]);
    if (settled?.kind === 'refreshed') revocationToken = settled.refreshToken;
  }

  let serverRevocation: 'confirmed' | 'unconfirmed' | 'rejected' = 'unconfirmed';
  if (revocationToken) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), LOGOUT_API_TIMEOUT);
      const response = await fetch(LOGOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: revocationToken }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      serverRevocation = response.ok ? 'confirmed' : 'rejected';
    } catch {
      serverRevocation = 'unconfirmed';
    }
  }

  // Local cleanup + redirect ALWAYS happen (finally semantics).
  currentRefreshAbort?.abort();
  currentRefreshAbort = null;
  clearTrackedSenders();
  useAuthStore.getState().clearAuth();
  logger.info('Logout complete', { serverRevocation });
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

/* ------------------------------------------------------------------ */
/* Bootstrap recovery                                                  */
/* ------------------------------------------------------------------ */

let recoveryInFlight = false;
let recoveryTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Recovers a hydrated session whose access token expired but whose refresh
 * token is still usable (B-1..B-4). Called by ProtectedRoute while
 * authInit === 'recovering'; single-flight and idempotent.
 */
export async function bootstrapRecovery(): Promise<void> {
  if (recoveryInFlight || loggingOut) return;
  const store = useAuthStore.getState();
  if (!store.refreshToken) {
    store.clearAuth();
    return;
  }
  recoveryInFlight = true;
  try {
    const outcome = await refreshAccessToken(store.token);
    switch (outcome.kind) {
      case 'refreshed':
        useAuthStore.getState().setAuthInit('ready');
        break;
      case 'throttled': {
        // Tokens preserved; the retry is scheduled at the server-provided
        // time — never earlier (RA-4..5). The UI cap only affects rendering.
        useAuthStore.getState().setAuthInit('throttled');
        const delay = Math.max(0, refreshNotBefore - Date.now());
        if (recoveryTimer) clearTimeout(recoveryTimer);
        recoveryTimer = setTimeout(() => {
          recoveryInFlight = false;
          void bootstrapRecovery();
        }, delay);
        break;
      }
      case 'rejected':
      case 'ambiguous':
        recoveryInFlight = false;
        endSession(`bootstrap refresh ${outcome.kind}`);
        return;
      case 'unavailable':
        useAuthStore.getState().clearAuth();
        break;
    }
  } finally {
    recoveryInFlight = false;
  }
}
