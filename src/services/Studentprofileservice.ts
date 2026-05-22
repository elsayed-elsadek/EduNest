
import api from './api';

// Prefix relative /uploads/... paths with the backend base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const toAbsolute = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
};

const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  try {
    return (await request).data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

export interface StudentProfileInfo {
  name:                 string;
  email:                string;
  address:              string | null;
  facebookLink:         string | null;
  linkedInLink:         string | null;
  githubLink:           string | null;
  activeMentorships:    number;
  completedMentorships: number;
  totalPoints:          number;
  avatar?:              string;  // absolute — mapped from imageUrl
  coverImage?:          string;
}

export interface EnrolledMentorship {
  mentorshipId:     number | string;
  title:            string;
  imageUrl?:        string;   // absolute URL for mentorship cover
  status:           string;
  totalPoints:      number;
  totalTasks:       number;
  submittedTasks:   number;
  totalQuizzes:     number;
  submittedQuizzes: number;
}

export interface StudentProject {
  id:              string | number;
  title:           string;
  mentorship:      string;
  status:          string;
  submissionDate:  string;
  filesCount?:     number;
  feedback?:       string;
  submissionLink?: string;
  rawScore?:       number;
  finalScore?:     number;
}

export interface AwardedBadgeRaw {
  id:              number;
  badgeId:         number;
  badgeTitle:      string;
  studentId:       number;
  studentFullName: string;
  awardedById:     number;
  awardedAt:       string;
  note?:           string;
  badgePoints:     number;
}

export interface StudentFullProfile {
  info: StudentProfileInfo;
  mentorships: {
    content:       EnrolledMentorship[];
    page:          number;
    size:          number;
    totalElements: number;
    totalPages:    number;
  };
  projects: {
    content:       StudentProject[];
    page:          number;
    size:          number;
    totalElements: number;
    totalPages:    number;
  };
  awardedBadges: AwardedBadgeRaw[];
}

export const getStudentFullProfile = (
  studentId: string | number,
  options?: {
    mentorshipsPage?: number;
    mentorshipsSize?: number;
    projectsPage?:   number;
    projectsSize?:   number;
    projectsStatus?: string;
  }
) =>
  handleRequest(
    api.get(`profile/students/${studentId}/full-profile`, {
      params: {
        mentorshipsPage: options?.mentorshipsPage ?? 0,
        mentorshipsSize: options?.mentorshipsSize ?? 6,
        projectsPage:    options?.projectsPage    ?? 0,
        projectsSize:    options?.projectsSize    ?? 6,
        ...(options?.projectsStatus ? { projectsStatus: options.projectsStatus } : {}),
      },
    })
  );

export const extractStudentFullProfile = (response: unknown): StudentFullProfile | null => {
  if (!response || typeof response !== 'object') return null;
  const res         = response as Record<string, unknown>;
  const apiResponse = res.apiResponse as Record<string, unknown> | undefined;
  if (!apiResponse) return null;
  const fullProfile = apiResponse.studentFullProfile as Record<string, unknown> | undefined;
  if (!fullProfile) return null;

  // ── Profile info ──────────────────────────────────────────────────────────
  const raw = (fullProfile.profileStudentInformationForMentorResponse ?? {}) as Record<string, unknown>;
  const info: StudentProfileInfo = {
    name:                 String(raw.name  ?? ''),
    email:                String(raw.email ?? ''),
    address:              raw.address      ? String(raw.address)      : null,
    facebookLink:         raw.facebookLink ? String(raw.facebookLink) : null,
    linkedInLink:         raw.linkedInLink ? String(raw.linkedInLink) : null,
    githubLink:           raw.githubLink   ? String(raw.githubLink)   : null,
    activeMentorships:    Number(raw.activeMentorships    ?? 0),
    completedMentorships: Number(raw.completedMentorships ?? 0),
    totalPoints:          Number(raw.totalPoints          ?? 0),
    avatar:     toAbsolute((raw.imageUrl ?? raw.avatar) as string | null),
    coverImage: toAbsolute(raw.coverImage as string | null),
  };

  // ── Mentorships ───────────────────────────────────────────────────────────
  const mentorshipsRaw = (fullProfile.enrolledMentorshipProgressDtoPageResponse ?? {}) as Record<string, unknown>;
  const mentorshipsContent: EnrolledMentorship[] = Array.isArray(mentorshipsRaw.content)
    ? (mentorshipsRaw.content as Record<string, unknown>[]).map(m => ({
        mentorshipId:     m.mentorshipId as number,
        title:            String(m.title            ?? ''),
        imageUrl:         toAbsolute(m.imageUrl as string | null),  // ← mentorship cover
        status:           String(m.status           ?? ''),
        totalPoints:      Number(m.totalPoints      ?? 0),
        totalTasks:       Number(m.totalTasks       ?? 0),
        submittedTasks:   Number(m.submittedTasks   ?? 0),
        totalQuizzes:     Number(m.totalQuizzes     ?? 0),
        submittedQuizzes: Number(m.submittedQuizzes ?? 0),
      }))
    : [];

  // ── Projects ──────────────────────────────────────────────────────────────
  const projectsRaw = (fullProfile.projectProfileDTOPageResponse ?? {}) as Record<string, unknown>;
  const projectsContent: StudentProject[] = Array.isArray(projectsRaw.content)
    ? (projectsRaw.content as Record<string, unknown>[]).map(p => ({
        id:             String(p.projectSubmissionId ?? p.id ?? ''),
        title:          String(p.projectTitle  ?? p.title      ?? 'Untitled'),
        mentorship:     String(p.mentorshipTitle ?? p.mentorship ?? 'N/A'),
        status:         String(p.status ?? 'SUBMITTED'),
        submissionDate: String(p.submittedAt ?? p.submissionDate ?? p.createdAt ?? ''),
        filesCount:     p.filesCount    != null ? Number(p.filesCount)  : undefined,
        feedback:       p.feedback       ? String(p.feedback)           : undefined,
        submissionLink: p.submissionLink ? String(p.submissionLink)     : undefined,
        rawScore:       p.rawScore    != null ? Number(p.rawScore)      : undefined,
        finalScore:     p.finalScore  != null ? Number(p.finalScore)    : undefined,
      }))
    : [];

  // ── Awarded badges ────────────────────────────────────────────────────────
  const awardedBadges: AwardedBadgeRaw[] = Array.isArray(fullProfile.badges)
    ? (fullProfile.badges as Record<string, unknown>[]).map(b => ({
        id:              Number(b.id              ?? 0),
        badgeId:         Number(b.badgeId         ?? 0),
        badgeTitle:      String(b.badgeTitle       ?? ''),
        studentId:       Number(b.studentId        ?? 0),
        studentFullName: String(b.studentFullName  ?? ''),
        awardedById:     Number(b.awardedById      ?? 0),
        awardedAt:       String(b.awardedAt        ?? ''),
        note:            b.note ? String(b.note)   : undefined,
        badgePoints:     Number(b.badgePoints      ?? 0),
      }))
    : [];

  return {
    info,
    mentorships: {
      content:       mentorshipsContent,
      page:          Number(mentorshipsRaw.page          ?? 0),
      size:          Number(mentorshipsRaw.size          ?? 6),
      totalElements: Number(mentorshipsRaw.totalElements ?? mentorshipsContent.length),
      totalPages:    Number(mentorshipsRaw.totalPages    ?? 1),
    },
    projects: {
      content:       projectsContent,
      page:          Number(projectsRaw.page          ?? 0),
      size:          Number(projectsRaw.size          ?? 6),
      totalElements: Number(projectsRaw.totalElements ?? projectsContent.length),
      totalPages:    Number(projectsRaw.totalPages    ?? 1),
    },
    awardedBadges,
  };
};