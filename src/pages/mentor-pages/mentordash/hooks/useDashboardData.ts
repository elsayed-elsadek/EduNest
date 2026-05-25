import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import {
  getMentorDashboard,
  getDashboardReviews,
  getDashboardSessions,
  type MentorDashboardParams,
  type MentorDashboardResponse,
} from '../../../../services/mentorDashboardService';
import {
  isApiErrorResponse,
  extractCardsData,
  mapSessions,
  mapReviews,
  mapRevenueChart,
  mapNotifications,
} from '../utils/mappers';
import type { DashboardCardsData } from '../types';
import type { Session } from '../../../../components/mentor-components/mentor-dash-com/ScheduledSessions/ScheduledSessions.types';
import type { Review } from '../../../../components/mentor-components/mentor-dash-com/Reviews/Reviews.types';
import type { SalesData } from '../../../../components/mentor-components/mentor-dash-com/SalesChart/SalesChart.types';
import type { Notification } from '../../../../types/mentornotification.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;          // 0-based (matches backend)
  totalPages: number;
  totalElements: number;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 0,
  totalPages: 1,
  totalElements: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(e: unknown): string {
  if (!e) return 'Failed to load data';
  if (typeof e === 'string') return e;
  if (typeof e === 'object' && e !== null) {
    const obj = e as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message) return obj.message;
    if (typeof obj.error   === 'string' && obj.error)   return obj.error;
  }
  return 'Failed to load data';
}

function parsePaginationMeta(raw: Record<string, unknown>, page: number): PaginationMeta {
  return {
    page:          Number(raw.page          ?? page),
    totalPages:    Number(raw.totalPages    ?? 1),
    totalElements: Number(raw.totalElements ?? 0),
  };
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export const useDashboardData = () => {
  const navigate = useNavigate();
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const logout     = useAuthStore((s) => s.logout);
  const userName   = useAuthStore((s) => s.userName);

  const displayName = userName?.trim().split(/\s+/)[0] || userName || 'Mentor';
  const welcomeDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // ── Global (initial load) state ──────────────────────────────────────────────
  const [cards, setCards]               = useState<DashboardCardsData | null>(null);
  const [revenueData, setRevenueData]   = useState<SalesData[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPagination, setNotificationPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [initialLoading, setInitialLoading] = useState(true);
  const [globalError, setGlobalError]   = useState<string | null>(null);

  // ── Reviews section state ────────────────────────────────────────────────────
  const [reviews, setReviews]               = useState<Review[]>([]);
  const [reviewPagination, setReviewPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError]     = useState<string | null>(null);

  // ── Sessions section state ───────────────────────────────────────────────────
  const [sessions, setSessions]               = useState<Session[]>([]);
  const [sessionPagination, setSessionPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError]     = useState<string | null>(null);

  // ── Auth guards ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().token) navigate('/login');
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    if (isHydrated && !token) navigate('/login');
  }, [isHydrated, token, navigate]);

  // ── Reviews fetch ────────────────────────────────────────────────────────────
  const fetchReviews = useCallback(
    (page: number) => {
      if (!isHydrated || !token) return;

      setReviewsLoading(true);
      setReviewsError(null);

      getDashboardReviews(page)
        .then((res) => {
          const reviewsObj = (res as { apiResponse?: { reviews?: Record<string, unknown> } })
            ?.apiResponse?.reviews as Record<string, unknown> | undefined;

          if (!reviewsObj) throw new Error('Invalid reviews response');

          const content = Array.isArray(reviewsObj.content) ? reviewsObj.content : [];
          setReviews(mapReviews({ content }));
          setReviewPagination(parsePaginationMeta(reviewsObj, page));
        })
        .catch((err) => {
          setReviewsError(getErrorMessage(err));
        })
        .finally(() => {
          setReviewsLoading(false);
        });
    },
    [isHydrated, token],
  );

  // ── Sessions fetch ───────────────────────────────────────────────────────────
  const fetchSessions = useCallback(
    (page: number) => {
      if (!isHydrated || !token) return;

      setSessionsLoading(true);
      setSessionsError(null);

      getDashboardSessions(page)
        .then((res) => {
          const sessionsObj = (res as { apiResponse?: { sessions?: Record<string, unknown> } })
            ?.apiResponse?.sessions as Record<string, unknown> | undefined;

          if (!sessionsObj) throw new Error('Invalid sessions response');

          const content = Array.isArray(sessionsObj.content) ? sessionsObj.content : [];
          setSessions(mapSessions({ content }));
          setSessionPagination(parsePaginationMeta(sessionsObj, page));
        })
        .catch((err) => {
          setSessionsError(getErrorMessage(err));
        })
        .finally(() => {
          setSessionsLoading(false);
        });
    },
    [isHydrated, token],
  );

  // ── Initial load: cards + notifications + revenue from the combined endpoint ──
  // Use a ref to call the section fetches exactly once without adding them to deps
  const fetchReviewsRef  = useRef(fetchReviews);
  const fetchSessionsRef = useRef(fetchSessions);
  fetchReviewsRef.current  = fetchReviews;
  fetchSessionsRef.current = fetchSessions;

  useEffect(() => {
    if (!isHydrated || !token) return;

    let cancelled = false;

    setInitialLoading(true);
    setGlobalError(null);

    type AnyDashboard = MentorDashboardResponse & { dashboard?: unknown; data?: unknown };

    const params: MentorDashboardParams = {
      // Only fetch cards & notifications from the combined endpoint
      notificationPage: 0,
      notificationSize: 3,
      // We don't need reviews/sessions here — fetched separately below
      reviewPage: 0,
      reviewSize: 1,
      sessionPage: 0,
      sessionSize: 1,
    };

    getMentorDashboard(params)
      .then((res) => {
        if (cancelled) return;

        if (!res || typeof res !== 'object') throw new Error('Unexpected response');
        if (isApiErrorResponse(res)) throw res;

        const r = res as AnyDashboard;
        const dashboardObj = r.apiResponse?.dashboard ?? (r as AnyDashboard).dashboard ?? {};
        const dashObj = dashboardObj as Record<string, unknown>;

        // Cards
        setCards(extractCardsData(dashboardObj));

        // Revenue chart
        const mapped = mapRevenueChart(dashObj.salesChart);
        setRevenueData(mapped.length > 0 ? mapped : []);

        // Notifications
        const mappedNotis = mapNotifications(dashObj.notifications);
        setNotifications(mappedNotis);
        const notisRaw = dashObj.notifications as Record<string, unknown> | undefined;
        if (notisRaw) {
          setNotificationPagination(parsePaginationMeta(notisRaw, 0));
        }

        setInitialLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          const message = getErrorMessage(err);
          setGlobalError(message);
          if (/invalid jwt|jwt token|unauthorized/i.test(message)) {
            logout();
            navigate('/login');
          }
          setInitialLoading(false);
        }
      });

    // Kick off section-specific fetches in parallel
    fetchReviewsRef.current(0);
    fetchSessionsRef.current(0);

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isHydrated, navigate, logout]);

  // ── Pagination handlers (call dedicated endpoints) ───────────────────────────
  const handleReviewPageChange = useCallback(
    (page: number) => fetchReviews(page),
    [fetchReviews],
  );

  const handleSessionPageChange = useCallback(
    (page: number) => fetchSessions(page),
    [fetchSessions],
  );

  /** Notifications still use the combined endpoint (no dedicated one yet) */
  const handleNotificationPageChange = useCallback(
    (page: number) => {
      if (!isHydrated || !token) return;

      type AnyDashboard = MentorDashboardResponse & { dashboard?: unknown };

      getMentorDashboard({
        notificationPage: page,
        notificationSize: 3,
        reviewPage: 0, reviewSize: 1,
        sessionPage: 0, sessionSize: 1,
      })
        .then((res) => {
          const r = res as AnyDashboard;
          const dashObj = (
            r.apiResponse?.dashboard ?? (r as AnyDashboard).dashboard ?? {}
          ) as Record<string, unknown>;

          const mappedNotis = mapNotifications(dashObj.notifications);
          setNotifications(mappedNotis);
          const notisRaw = dashObj.notifications as Record<string, unknown> | undefined;
          if (notisRaw) setNotificationPagination(parsePaginationMeta(notisRaw, page));
        })
        .catch((err) => setGlobalError(getErrorMessage(err)));
    },
    [isHydrated, token],
  );

  return {
    // Data
    cards,
    sessions,
    reviews,
    revenueData,
    notifications,

    // Loading / error — unified for the page-level skeleton
    loading: initialLoading,
    error:   globalError,

    // Per-section loading states (for inline spinners if needed)
    reviewsLoading,
    sessionsLoading,
    reviewsError,
    sessionsError,

    // Auth
    isHydrated,
    displayName,
    welcomeDate,

    // Pagination meta
    reviewPagination,
    sessionPagination,
    notificationPagination,

    // Pagination handlers
    handleReviewPageChange,
    handleSessionPageChange,
    handleNotificationPageChange,
  };
};
