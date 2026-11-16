# FE-008 — Session & Token Storage Decision Record

**Status:** Approved fallback implemented (Security sign-off pending)
**Related:** EF-25 ([FE-008] Harden authentication session and token lifecycle)
**Decided by:** FE team — to be countersigned by Tech Lead + Security.

## Context

The JWT was previously written to `localStorage` **twice** (inside the
`auth-storage` zustand blob and again under a separate `token` key) regardless
of the "remember me" choice. There was no `exp` validation, no global 401
handling, and `logout()` wiped the whole `localStorage`, destroying unrelated
preferences such as the theme.

## Decision (implemented)

1. **Single source of truth** — the zustand persisted blob `auth-storage` is
   the only place the access token is stored. The duplicate `token` key is
   removed on load (migration) and never written again.
2. **Session-aware storage routing**
   - "Remember me" **checked** → session persists in `localStorage` (survives
     refresh and restart within the token's own expiry window).
   - "Remember me" **unchecked** → session lives in `sessionStorage` only, so
     closing the tab ends the session (TC-AUTH-04).
3. **Expiry validation** — `isTokenValid()` / `getTokenExpiration()`
   (`src/utils/jwt.ts`) check the `exp` claim (30s clock-skew allowance).
   Tokens are validated:
   - on hydration (`onRehydrateStorage`) — an expired/malformed stored token is
     wiped and treated as unauthenticated (TC-AUTH-06);
   - before every protected request (`src/services/api.ts`);
   - in `ProtectedRoute` — an expired token renders `/login?reason=expired`;
   - at login — a malformed token from the API never authenticates the session.
   A token **without** an `exp` claim is treated as structurally valid; the
   live 401 handler remains the authoritative signal in that case.
4. **One 401 handler** — `handleSessionExpired()` (`src/store/authStore.ts`) is
   the single entry point for "session no longer usable" (expiry, malformed
   token, 401 from any endpoint). A module-level once-guard guarantees the
   state is cleared and the redirect to `/login?reason=expired` happens exactly
   once — no redirect loops, no 401 storms.
5. **Targeted logout** — `logout()` removes only auth-domain keys
   (`auth-storage`, legacy `token`, `restoreEmail`, `registrationEmail`,
   `registrationType`, `resetEmail`). Unrelated preferences (`theme`, …)
   survive (AC: theme survives logout).

## Accepted risk

The access token remains readable from web storage (XSS exposure). This is the
**approved fallback**. The preferred design — **short-lived access token in
memory + refresh token in an HttpOnly cookie** — requires the Backend refresh
contract and is tracked as a follow-up. When the backend ships refresh
endpoints, this store is the single integration point to replace.

## Not in scope

- Backend token issuance / refresh endpoints.
- RBAC enforcement (FE-009).
