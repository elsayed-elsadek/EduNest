/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";
import { handleRequest, type TaskSubmissionItem } from "../mentorshipsContent";

export interface SubmitTaskPayload {
  file?: File;
  fileUrl?: string;
}

export interface SubmitTaskResult {
  submission: TaskSubmissionItem;
  message?: string;
}

export const submitTask = async (
  taskId: number,
  payload: SubmitTaskPayload
): Promise<SubmitTaskResult> => {
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
    let submission = raw as TaskSubmissionItem;
    let message: string | undefined;

    if (data?.apiResponse && typeof data.apiResponse === 'object') {
      const apiResponse = data.apiResponse as Record<string, unknown>;
      if (typeof apiResponse.message === 'string' && apiResponse.message.trim()) {
        message = apiResponse.message;
      }
      submission = (apiResponse['submission'] || data.apiResponse) as TaskSubmissionItem;
    }

    return { submission, message };
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
  // Path for student's uploaded submission (server field)
  uploadedSubmissionPath: string | null;
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
