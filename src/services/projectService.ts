import api from './api';

const BASE_URL = '/api/v1/project';

// Interfaces based on API Swagger

export interface ProjectDashboardStats {
  totalProjects: number;
  publishedCount: number;
  draftCount: number;
  averageScore: number;
}

export interface ProjectResponse {
  id: number;
  title: string;
  goal: string;
  brief: string;
  descriptionUrl: string | null;
  uploadedAttachmentPath: string | null;
  startAt: string;
  endAt: string;
  points: number;
  status: string; // "PUBLISHED" | "DRAFT"
  weekId: number;
  createdAt: string;
}

export interface ProjectListItem {
  project: ProjectResponse;
  totalStudents: number;
  submissionsCount: number;
}

export interface ProjectPageResponse {
  content: ProjectListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FullProjectDashboard {
  projectDashboardDTO: ProjectDashboardStats;
  projectResponsePageResponse: ProjectPageResponse;
}

export interface GetProjectDashboardParams {
  projectName?: string;
  status?: string;
  page?: number;
  size?: number;
}

/** 
 * GET /api/v1/project/full-dashboard/{mentorshipId} 
 * Get full project dashboard (dashboard + projects list)
 */
export const getProjectDashboard = async (
  mentorshipId: string | number,
  params?: GetProjectDashboardParams
): Promise<{ message: string; fullDashboard: FullProjectDashboard }> => {
  const response = await api.get(`${BASE_URL}/full-dashboard/${mentorshipId}`, { params });
  return response.data?.apiResponse || response.data;
};

export interface TaskSubmission {
  submissionId: number;
  projectId: number;
  studentId: number;
  studentFullName: string;
  fileUrl: string | null;
  uploadedFilePath: string | null;
  submittedAt: string;
  isLate: boolean;
  status: string; // "SUBMITTED" | "GRADED"
  rawScore: number | null;
  finalScore: number | null;
  feedback: string | null;
}

export interface SubmissionPageResponse {
  content: TaskSubmission[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ProjectStatistics {
  status: string;
  projectTitle: string;
  totalStudents: number;
  totalSubmissions: number;
  pendingReview: number;
  createdAt: string;
  deadLine: string;
  totalPoints: number;
  taskSubmissionResponsePageResponse: SubmissionPageResponse;
}

/**
 * GET /api/v1/project/{projectId}/statistics
 * Get project statistics and submission list
 */
export const getProjectStatistics = async (
  projectId: string | number,
  params?: { page?: number; size?: number }
): Promise<{ message: string; projectStatistics: ProjectStatistics }> => {
  const response = await api.get(`${BASE_URL}/${projectId}/statistics`, { params });
  return response.data?.apiResponse || response.data;
};

/**
 * POST /api/v1/project/submissions/{submissionId}/grade
 * Grade a project submission
 */
export const gradeProjectSubmission = async (
  submissionId: string | number,
  data: { score: number; feedback: string }
): Promise<any> => {
  const response = await api.post(`${BASE_URL}/submissions/${submissionId}/grade`, data);
  return response.data;
};

/**
 * DELETE /api/v1/project/{id}
 * Delete project by ID
 */
export const deleteProject = async (id: string | number): Promise<any> => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * PATCH /api/v1/project/{id}
 * Update project Entity
 */
export const updateProject = async (id: string | number, formData: FormData): Promise<any> => {
  const response = await api.patch(`${BASE_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * POST /api/v1/project
 * Create project with optional file attachment
 */
export const createProject = async (formData: FormData): Promise<any> => {
  const response = await api.post(`${BASE_URL}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
