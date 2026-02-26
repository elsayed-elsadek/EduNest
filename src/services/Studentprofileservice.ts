
import api from './api';

const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

// Types 

export interface StudentProfileInfo {
  name: string;
  email: string;
  address: string | null;
  facebookLink: string | null;
  linkedInLink: string | null;
  githubLink: string | null;
  activeMentorships: number;
  completedMentorships: number;
  totalPoints: number;
  avatar?: string;
  coverImage?: string;
}

export interface EnrolledMentorship {
  mentorshipId: number | string;
  title: string;
  status: string;          
  totalPoints: number;
  totalTasks: number;
  submittedTasks: number;
  totalQuizzes: number;
  submittedQuizzes: number;
}

export interface StudentProject {
  id: string | number;
  title: string;
  mentorship: string;
  status: string;
  submissionDate: string;
  filesCount?: number;
  feedback?: string;
  submissionLink?: string;   
  rawScore?: number;
  finalScore?: number;
}

export interface StudentFullProfile {
  info: StudentProfileInfo;
  mentorships: {
    content: EnrolledMentorship[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  projects: {
    content: StudentProject[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

//  API Call

/** GET /profile/students/{studentId}/full-profile */
export const getStudentFullProfile = (
  studentId: string | number,
  options?: {
    mentorshipsPage?: number;
    mentorshipsSize?: number;
    projectsPage?: number;
    projectsSize?: number;
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
        projectsStatus:  options?.projectsStatus  ?? 'SUBMITTED',
      },
    })
  );

//  Extractor 

export const extractStudentFullProfile = (response: unknown): StudentFullProfile | null => {
  if (!response || typeof response !== 'object') return null;

  const res = response as Record<string, unknown>;

  // : { apiResponse: { studentFullProfile: { ... } } }
  const apiResponse = res.apiResponse as Record<string, unknown> | undefined;
  if (!apiResponse) return null;

  const fullProfile = apiResponse.studentFullProfile as Record<string, unknown> | undefined;
  if (!fullProfile) return null;

  //  Profile Info 
  const raw = (fullProfile.profileStudentInformationForMentorResponse ?? {}) as Record<string, unknown>;

  const info: StudentProfileInfo = {
    name:                 String(raw.name  ?? ''),
    email:                String(raw.email ?? ''),
    address:              raw.address      ? String(raw.address)    : null,
    facebookLink:         raw.facebookLink ? String(raw.facebookLink) : null,
    linkedInLink:         raw.linkedInLink ? String(raw.linkedInLink) : null,
    githubLink:           raw.githubLink   ? String(raw.githubLink)   : null,
    activeMentorships:    Number(raw.activeMentorships    ?? 0),
    completedMentorships: Number(raw.completedMentorships ?? 0),
    totalPoints:          Number(raw.totalPoints          ?? 0),
    avatar:               raw.avatar       ? String(raw.avatar)       : undefined,
    coverImage:           raw.coverImage   ? String(raw.coverImage)   : undefined,
  };

  // Enrolled Mentorships 
  const mentorshipsRaw = (fullProfile.enrolledMentorshipProgressDtoPageResponse ?? {}) as Record<string, unknown>;
  const mentorshipsContent: EnrolledMentorship[] = Array.isArray(mentorshipsRaw.content)
    ? (mentorshipsRaw.content as Record<string, unknown>[]).map((m) => ({
        mentorshipId:    m.mentorshipId as number,
        title:           String(m.title ?? ''),
        status:          String(m.status ?? ''),
        totalPoints:     Number(m.totalPoints     ?? 0),
        totalTasks:      Number(m.totalTasks      ?? 0),
        submittedTasks:  Number(m.submittedTasks  ?? 0),
        totalQuizzes:    Number(m.totalQuizzes    ?? 0),
        submittedQuizzes: Number(m.submittedQuizzes ?? 0),
      }))
    : [];

  //  Projects 
  const projectsRaw = (fullProfile.projectProfileDTOPageResponse ?? {}) as Record<string, unknown>;
  const projectsContent: StudentProject[] = Array.isArray(projectsRaw.content)
    ? (projectsRaw.content as Record<string, unknown>[]).map((p) => ({
        id:             String(p.projectSubmissionId ?? p.id ?? ''),
        title:          String(p.projectTitle        ?? p.title ?? 'Untitled Project'),
        mentorship:     String(p.mentorshipTitle     ?? p.mentorship ?? 'N/A'),
        //  API (SUBMITTED / GRADED / REJECTED)
        status:         String(p.status ?? 'SUBMITTED'),
        submissionDate: String(p.submittedAt ?? p.submissionDate ?? p.createdAt ?? ''),
        filesCount:     p.filesCount != null ? Number(p.filesCount) : undefined,
        feedback:       p.feedback       ? String(p.feedback)       : undefined,
        submissionLink: p.submissionLink ? String(p.submissionLink) : undefined,
        rawScore:       p.rawScore   != null ? Number(p.rawScore)   : undefined,
        finalScore:     p.finalScore != null ? Number(p.finalScore) : undefined,
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
  };
};