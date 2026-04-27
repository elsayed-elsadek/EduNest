import api from '../api';
import { handleRequest } from './utils';

// ─── Types ───────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  weekId: number;
  description?: string;
  points: number;
  passPoints: number;
  estimatedMinutes?: number;
  dueAt?: string;
  attachmentUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  points?: number;
  passPoints?: number;
  estimatedMinutes?: number;
  dueAt?: string;
  attachmentUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface TaskDashboardDTO {
  totalTasks: number;
  publishedCount: number;
  draftCount: number;
  averageScore: number;
}

export interface TaskResponseContent {
  uploadedAttachmentPath: string | undefined;
  id: number;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  description?: string;
  points?: number;
  passPoints?: number;
  estimatedMinutes?: number;
  dueAt?: string;
  attachmentUrl?: string;
  submissions?: number;
  averageScore?: number;
  studentSubmission?: TaskSubmissionItem | null;
}

export interface TaskResponsePageResponse {
  content: TaskResponseContent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TaskFullDashboard {
  taskDashboardDTO: TaskDashboardDTO;
  taskResponsePageResponse: TaskResponsePageResponse;
}

export interface TaskSubmission {
  id: number;
  studentId?: number;
  studentName: string;
  score: number | null;
  feedback?: string | null;
  status: 'GRADED' | 'SUBMITTED' | 'NOT_SUBMITTED';
  submittedAt?: string;
  fileUrl?: string;
  content?: string;
}

export interface TaskSubmissionPageResponse {
  content: TaskSubmission[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── STATISTICS API TYPES ─────────────────────────────────────────

export interface TaskStatistics {
  status: 'DRAFT' | 'PUBLISHED';
  taskTitle: string;
  totalStudents: number;
  totalSubmissions: number;
  pendingReview: number;
  createdAt: string;
  deadLine: string | null;
  totalPoints: number;
  taskSubmissionResponsePageResponse: {
    content: TaskSubmissionItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface TaskSubmissionItem {
  submissionId: number;
  taskId: number;
  studentId: number;
  studentFullName: string;
  fileUrl: string | null;
  uploadedFilePath: string | null;
  submittedAt: string;
  isLate: boolean;
  status: 'SUBMITTED' | 'GRADED' | 'NOT_SUBMITTED';
  rawScore: number | null;
  finalScore: number | null;
  feedback: string | null;
}

export interface TaskStatisticsResponse {
  taskStatistics: TaskStatistics;
}

export interface GradePayload {
  score: number;
  feedback?: string;
}

// ─── CREATE TASK ─────────────────────────────────────────────────

export const createTask = async (
  payload: CreateTaskPayload,
  attachmentFile?: File
): Promise<unknown> => {

  try {
    // Use multipart/form-data with "req" key containing JSON string (like Postman)
    const formData = new FormData();

    const jsonBody = {
      title: payload.title,
      weekId: payload.weekId,
      description: payload.description || null,
      points: payload.points,
      passPoints: payload.passPoints,
      estimatedMinutes: payload.estimatedMinutes || null,
      dueAt: payload.dueAt || null,
      attachmentUrl: payload.attachmentUrl || null,
      status: payload.status || 'DRAFT'
    };

    const jsonBlob = new Blob([JSON.stringify(jsonBody)], {
      type: 'application/json'
    });

    formData.append("req", jsonBlob);

    // Append file if exists
    if (attachmentFile) {
      formData.append("file", attachmentFile);
    }

    const raw = await handleRequest(
      api.post("api/v1/task", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );

    return raw;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {

    console.error("Create Task Error:", error?.response?.data || error);

    throw error;
  }
};

// ─── DELETE TASK ─────────────────────────────────────────────────

export const deleteTask = async (id: number): Promise<void> => {
  await handleRequest(api.delete(`api/v1/task/${id}`));
};

// ─── UPDATE TASK ─────────────────────────────────────────────────

export const updateTask = async (
  id: number,
  payload: UpdateTaskPayload,
  attachmentFile?: File
): Promise<unknown> => {

  try {
    const formData = new FormData();

    const jsonBody = {
      title: payload.title,
      description: payload.description,
      points: payload.points,
      passPoints: payload.passPoints,
      estimatedMinutes: payload.estimatedMinutes,
      dueAt: payload.dueAt,
      attachmentUrl: payload.attachmentUrl,
      status: payload.status
    };

    // Remove undefined fields
    Object.keys(jsonBody).forEach(key => {
      if (jsonBody[key as keyof typeof jsonBody] === undefined) {
        delete jsonBody[key as keyof typeof jsonBody];
      }
    });

    const jsonBlob = new Blob([JSON.stringify(jsonBody)], {
      type: 'application/json'
    });

    formData.append("req", jsonBlob);

    if (attachmentFile) {
      formData.append("file", attachmentFile);
    }

    const raw = await handleRequest(
      api.patch(`api/v1/task/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );

    return raw;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {

    console.error("Update Task Error:", error?.response?.data || error);

    throw error;
  }
};

// ─── DASHBOARD ───────────────────────────────────────────────────

export const getTaskFullDashboard = async (
  mentorshipId: number,
  taskName?: string,
  status?: string,
  page: number = 0,
  size: number = 6
): Promise<TaskFullDashboard> => {

  const params = new URLSearchParams();

  if (taskName) params.append("taskName", taskName);
  if (status) params.append("status", status);

  params.append("page", page.toString());
  params.append("size", size.toString());

  const raw = await handleRequest(
    api.get(`api/v1/task/full-dashboard/${mentorshipId}?${params.toString()}`)
  );

  const data = raw as Record<string, unknown>;
  if (data?.apiResponse && typeof data.apiResponse === 'object') {
    const res = (data.apiResponse as Record<string, unknown>)['fullDashboard'] || data.apiResponse;
    return res as TaskFullDashboard;
  }
  return raw as TaskFullDashboard;
};

// ─── GET TASK BY ID ──────────────────────────────────────────────

export const getTaskById = async (
  taskId: number
): Promise<TaskResponseContent> => {

  const raw = await handleRequest(
    api.get(`api/v1/task/${taskId}`)
  );

  const data = raw as Record<string, unknown>;
  if (data?.apiResponse && typeof data.apiResponse === 'object') {
    const res = (data.apiResponse as Record<string, unknown>)['task'] || data.apiResponse;
    return res as TaskResponseContent;
  }
  return raw as TaskResponseContent;
};

// ─── SUBMISSIONS ─────────────────────────────────────────────────

export const getTaskSubmissions = async (
  taskId: number,
  page: number = 0,
  size: number = 10
): Promise<TaskSubmissionPageResponse> => {

  const raw = await handleRequest(
    api.get(`api/v1/task-submission/${taskId}?page=${page}&size=${size}`)
  );

  const data = raw as Record<string, unknown>;
  if (data?.apiResponse && typeof data.apiResponse === 'object') {
    const res = (data.apiResponse as Record<string, unknown>)['taskSubmissionPageResponse'] || data.apiResponse;
    return res as TaskSubmissionPageResponse;
  }
  return raw as TaskSubmissionPageResponse;
};

// ─── TASK STATISTICS ─────────────────────────────────────────────

export const getTaskStatistics = async (
  taskId: number,
  page: number = 0,
  size: number = 6
): Promise<TaskStatistics> => {

  const raw = await handleRequest(
    api.get(`api/v1/task/${taskId}/statistics?page=${page}&size=${size}`)
  );

  const data = raw as Record<string, unknown>;
  if (data?.apiResponse && typeof data.apiResponse === 'object') {
    const res = (data.apiResponse as Record<string, unknown>)['taskStatistics'];
    if (res) return res as TaskStatistics;
  }
  return raw as TaskStatistics;
};

// ─── GRADE ───────────────────────────────────────────────────────

export const gradeTaskSubmission = async (
  submissionId: number,
  payload: GradePayload
): Promise<unknown> => {

  const raw = await handleRequest(
    api.post(`api/v1/task-submission/${submissionId}/grade`, payload)
  );

  return raw;
};




