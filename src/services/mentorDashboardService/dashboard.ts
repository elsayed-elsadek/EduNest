import { handleRequest, MENTOR_DASHBOARD_BASE } from './request';
import api from '../api';

const BASE = MENTOR_DASHBOARD_BASE;

/**
 * Parameters accepted by the new single-dashboard endpoint.
 * All fields are optional; the backend will apply defaults when omitted.
 */
export interface MentorDashboardParams {
  reviewPage?: number;
  reviewSize?: number;
  sessionPage?: number;
  sessionSize?: number;
  notificationPage?: number;
  notificationSize?: number;
  months?: number;
}

/** Common pagination params used by several dashboard endpoints */
export interface PaginationParams {
  page?: number;
  size?: number;
}

/**
 * Shape of the combined dashboard response returned by the new endpoint.
 * The service simply proxies whatever the backend returns; callers can
 * inspect `apiResponse.dashboard` to access the data.
 */
export interface MentorDashboardResponse {
  apiResponse: {
    dashboard: Record<string, unknown>;
  };
}

/** GET /api/v1/dashboard
 *  Combined dashboard endpoint — used for the initial page load (cards,
 *  notifications, revenue chart). Accepts query parameters described in
 *  `MentorDashboardParams`.
 */
export const getMentorDashboard = (
  params?: MentorDashboardParams,
) => handleRequest(api.get<MentorDashboardResponse>(`${BASE}`, { params }));

// ─── Dedicated section endpoints ───────────────────────────────────────────

/** Shape returned by GET /api/v1/dashboard/reviews */
export interface DashboardReviewsResponse {
  apiResponse: {
    reviews: {
      content: unknown[];
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
    };
  };
}

/** GET /api/v1/dashboard/reviews?page=&size= */
export const getDashboardReviews = (page: number, size = 6) =>
  handleRequest(
    api.get<DashboardReviewsResponse>(`${BASE}/reviews`, { params: { page, size } }),
  );

/** Shape returned by GET /api/v1/dashboard/sessions */
export interface DashboardSessionsResponse {
  apiResponse: {
    sessions: {
      content: unknown[];
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
    };
  };
}

/** GET /api/v1/dashboard/sessions?page=&size= */
export const getDashboardSessions = (page: number, size = 5) =>
  handleRequest(
    api.get<DashboardSessionsResponse>(`${BASE}/sessions`, { params: { page, size } }),
  );

/** Shape returned by GET /api/v1/dashboard/revenue-chart */
export interface DashboardRevenueChartResponse {
  apiResponse: {
    'sales-chart': Array<{ month: string; year: number; totalRevenue: number }>;
  };
}

/** GET /api/v1/dashboard/revenue-chart?months= */
export const getDashboardRevenueChart = (months = 6) =>
  handleRequest(
    api.get<DashboardRevenueChartResponse>(`${BASE}/revenue-chart`, { params: { months } }),
  );

/** GET /api/v1/dashboard/{id}/top-learners */
export const getTopLearners = (
  mentorshipId: string,
  params?: PaginationParams
) => handleRequest(api.get(`${BASE}/${mentorshipId}/top-learners`, { params }));

/** GET /api/v1/dashboard/{id}/stats */
export interface MentorshipStats {
  title: string;
  status: string; // e.g. 'DRAFT' | 'PUBLISHED'
  totalQuizzes: number;
  totalLessons: number;
  totalAssignments: number;
  totalSessions: number;
  totalProjects: number;
  [key: string]: unknown;
}

export const getMentorshipStats = (mentorshipId: string) =>
  handleRequest(api.get<MentorshipStats>(`${BASE}/${mentorshipId}/stats`));

/** GET /api/v1/dashboard/{id}/reviews */
export const getMentorshipReviews = (
  mentorshipId: string,
  params?: PaginationParams
) => handleRequest(api.get(`${BASE}/${mentorshipId}/reviews`, { params }));

export interface FullMentorshipDashboardParams {
  reviewsPage?: number;
  reviewsSize?: number;
  topPage?: number;
  topSize?: number;
}

export interface MentorshipPaginatedItems<T = unknown> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FullMentorshipDashboard {
  stats: MentorshipStats;
  reviews: MentorshipPaginatedItems;
  topLearners: MentorshipPaginatedItems;
  studentsRanks: MentorshipPaginatedItems;
}

export interface FullMentorshipDashboardResponse {
  apiResponse: {
    dashboard: FullMentorshipDashboard;
  };
}

/** GET /api/v1/dashboard/mentorship/{id} 
 *  Combined endpoint for stats, top learners, reviews, and student ranks
 */
export const getFullMentorshipDashboard = (
  mentorshipId: string | number,
  params?: FullMentorshipDashboardParams
) => handleRequest(api.get<FullMentorshipDashboardResponse>(`${BASE}/mentorship/${mentorshipId}`, { params }));


/**
 * Legacy helpers that previously hit individual dashboard endpoints.
 * The backend now only exposes a single `/dashboard` route, so these
 * functions call through to `getMentorDashboard()` and return the
 * relevant piece of data.  They remain exported for compatibility
 * with code that may not yet have been migrated.
 */
// helper used by the legacy exports below.  It avoids `any` by
// treating the dashboard object as a plain string -> unknown map.
function extractPiece<T = unknown>(
  response: unknown,
  key: string
): T | undefined {
  if (!response || typeof response !== 'object') return undefined;
  const maybe = response as MentorDashboardResponse & { dashboard?: unknown };
  const dashObj =
    (maybe.apiResponse && typeof maybe.apiResponse === 'object'
      ? (maybe.apiResponse as Record<string, unknown>).dashboard
      : undefined) || maybe.dashboard;
  if (!dashObj || typeof dashObj !== 'object') return undefined;
  const dash = dashObj as Record<string, unknown>;
  return (dash[key] as T) ?? undefined;
}

export const getMentorStudents = (params?: PaginationParams) =>
  // backend exposes a dedicated students route under the dashboard base
  handleRequest(api.get(`${BASE}/students`, { params }));

export const getUpcomingSessions = () =>
  getMentorDashboard().then((r) => extractPiece(r, 'sessions'));

export const getMentorReviews = () =>
  getMentorDashboard().then((r) => extractPiece(r, 'reviews'));

export const getRevenueChart = () =>
  getMentorDashboard().then((r) => extractPiece(r, 'salesChart'));

export const getDashboardCards = () =>
  getMentorDashboard().then((r) => extractPiece(r, 'cards'));

// re-export helper functions defined in extractors.ts so consumers can
// import everything from this service module rather than reaching into
// the implementation file directly.
export {
  extractRevenueChartData,
  extractSessionsData,
  extractReviewsData,
  extractNotificationsData,
} from './extractors';
