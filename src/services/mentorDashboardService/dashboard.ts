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
 *  This single endpoint replaces the old individual calls for cards,
 *  reviews, sessions, revenue chart and notifications.  Accepts query
 *  parameters described in `MentorDashboardParams`.
 */
export const getMentorDashboard = (
  params?: MentorDashboardParams
) => handleRequest(api.get<MentorDashboardResponse>(`${BASE}`, { params }));

/** GET /api/v1/dashboard/{id}/top-learners */
export const getTopLearners = (mentorshipId: string) =>
  handleRequest(api.get(`${BASE}/${mentorshipId}/top-learners`));

/** GET /api/v1/dashboard/{id}/stats */
export const getMentorshipStats = (mentorshipId: string) =>
  handleRequest(api.get(`${BASE}/${mentorshipId}/stats`));

/** GET /api/v1/dashboard/{id}/reviews */
export const getMentorshipReviews = (mentorshipId: string) =>
  handleRequest(api.get(`${BASE}/${mentorshipId}/reviews`));

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

export const getMentorStudents = () =>
  getMentorDashboard().then((r) => extractPiece(r, 'students'));

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
