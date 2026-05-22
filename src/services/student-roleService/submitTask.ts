import api from "../api";
import { handleRequest, type TaskSubmissionItem } from "../mentorshipsContent";

export interface SubmitTaskPayload {
  file?: File;
  fileUrl?: string;
}

export const submitTask = async (
  taskId: number,
  payload: SubmitTaskPayload
): Promise<TaskSubmissionItem> => {
  try {
    const formData = new FormData();

    if (payload.file) {
      formData.append('file', payload.file);
    }

    const params = new URLSearchParams();
    if (payload.fileUrl) {
      params.append('fileUrl', payload.fileUrl);
    }

    const url = `api/v1/task-submission/${taskId}${params.toString() ? '?' + params.toString() : ''}`;

    const raw = await handleRequest(
      api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );

    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
      const res = (data.apiResponse as Record<string, unknown>)['submission'] || data.apiResponse;
      return res as TaskSubmissionItem;
    }
    return raw as TaskSubmissionItem;
  } catch (error: any) {
    console.error("Submit Task Error:", error?.response?.data || error);
    throw error;
  }
};

export interface StudentTaskDetails {
  taskId: number;
  taskTitle: string;
  points: number;
  dueAt: string | null;
  description: string | null;
  attachmentUrl: string | null;
  uploadedAttachmentPath: string | null;
  estimatedMinutes: number | null;
  submissionUrl: string | null;
  score: number | null;
  totalPoints: number;
  submissionStatus: 'GRADED' | 'SUBMITTED' | 'NOT_SUBMITTED' | string;
  feedback: string | null;
  mentorName: string | null;
  mentorPhoto: string | null;
}

export const getStudentTaskDetails = async (taskId: number): Promise<StudentTaskDetails> => {
  try {
    const raw = await handleRequest(api.get(`api/v1/task/${taskId}/student`));
    const data = raw as Record<string, any>;
    if (data?.apiResponse?.data) {
      return data.apiResponse.data as StudentTaskDetails;
    }
    return raw as StudentTaskDetails;
  } catch (error: any) {
    console.error("Get Student Task Details Error:", error?.response?.data || error);
    throw error;
  }
};
