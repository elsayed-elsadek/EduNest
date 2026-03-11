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
      formData.append("attachment", attachmentFile);
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
  payload: UpdateTaskPayload
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

  return raw as TaskFullDashboard;
};

// ─── GET TASK BY ID ──────────────────────────────────────────────

export const getTaskById = async (
  taskId: number
): Promise<TaskResponseContent> => {

  const raw = await handleRequest(
    api.get(`api/v1/task/${taskId}`)
  );

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

  return raw as TaskSubmissionPageResponse;
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