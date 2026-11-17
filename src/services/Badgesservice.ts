
import api from './api';
// EF-2: one canonical ApiValidationError (previously duplicated here) — the
// re-export keeps every existing import path and instanceof check working.
import { ApiValidationError, parseApiError } from './errors';

export { ApiValidationError } from './errors';

// ── Error handling — centralized in parseApiError (unified envelope first,
//    legacy `errorMessages` / `apiResponse.message` fallbacks, safe generic) ──
const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error) {
    const parsed = parseApiError(error);
    if (Object.keys(parsed.fields).length > 0) {
      throw new ApiValidationError(parsed.message, parsed.fields);
    }
    throw parsed.message;
  }
};

export type BadgeCategory =
  | 'ACHIEVEMENT' | 'PERFORMANCE' | 'CONSISTENCY' | 'PROBLEM_SOLVING'
  | 'CREATIVITY'  | 'LEADERSHIP'  | 'COMMUNITY'   | 'SPECIAL_RECOGNITION';

export interface BadgeDto {
  id:           number;
  mentorshipId: number;
  title:        string;
  category:     BadgeCategory;
  description:  string;
  points:       number;
}

export interface CreateBadgeInput {
  title:       string;
  category:    BadgeCategory;
  description: string;
  points:      number;
}

export interface AwardInput {
  studentId: number;
  note?:     string;
}

// GET /api/v1/badges/mentorship/{mentorshipId}
export const getBadgesByMentorship = (mentorshipId: string | number) =>
  handleRequest(api.get(`api/v1/badges/mentorship/${mentorshipId}`)) as
    Promise<{ apiResponse: { badges: BadgeDto[]; message?: string } }>;

// POST /api/v1/badges/mentorship/{mentorshipId}
export const createBadge = (mentorshipId: string | number, data: CreateBadgeInput) =>
  handleRequest(api.post(`api/v1/badges/mentorship/${mentorshipId}`, data)) as
    Promise<{ apiResponse: { badge: BadgeDto; message?: string } }>;

// PATCH /api/v1/badges/{badgeId}
export const updateBadge = (badgeId: number, data: Partial<CreateBadgeInput>) =>
  handleRequest(api.patch(`api/v1/badges/${badgeId}`, data)) as
    Promise<{ apiResponse: { badge: BadgeDto; message?: string } }>;

// DELETE /api/v1/badges/{badgeId}   (400 if already awarded)
export const deleteBadge = (badgeId: number) =>
  handleRequest(api.delete(`api/v1/badges/${badgeId}`)) as
    Promise<{ apiResponse?: { message?: string } }>;

// POST /api/v1/badge-awards/{badgeId}/award
export const awardBadge = (badgeId: number, data: AwardInput) =>
  handleRequest(api.post(`api/v1/badge-awards/${badgeId}/award`, data)) as
    Promise<{ apiResponse: { award: { id: number; badgeTitle: string; badgePoints: number; message?: string }; message?: string } }>;