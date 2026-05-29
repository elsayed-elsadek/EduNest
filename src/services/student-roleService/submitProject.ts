import api from "../api";
import { handleRequest } from "../mentorshipsContent";

export interface SubmitProjectPayload {
  file?: File;
  fileUrl?: string;
}

export interface SubmitProjectResult {
  submission: unknown;
  message?: string;
}

export interface ProjectSubmissionResponse {
  apiResponse: {
    submission?: unknown;
    message?: string;
  };
}

export const submitProject = async (
  projectId: number,
  payload: SubmitProjectPayload
): Promise<SubmitProjectResult> => {
  try {
    const formData = new FormData();

    if (payload.file) {
      formData.append('file', payload.file);
    }

    const params = new URLSearchParams();
    if (payload.fileUrl) {
      params.append('fileUrl', payload.fileUrl);
    }

    const url = `api/v1/project/${projectId}/submissions${params.toString() ? '?' + params.toString() : ''}`;

    const raw = await handleRequest(
      api.post<ProjectSubmissionResponse>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );

    if (raw?.apiResponse && typeof raw.apiResponse === 'object') {
      const apiResponse = raw.apiResponse as Record<string, unknown>;
      return {
        submission: apiResponse['submission'] ?? apiResponse,
        message: typeof apiResponse.message === 'string' ? apiResponse.message : undefined,
      };
    }
    return { submission: raw };
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error("Submit Project Error:", err?.response?.data ?? err?.message ?? error);
    throw error;
  }
};

export interface StudentProjectDetails {
  projectId: number;
  title: string;
  brief: string;
  descriptionUrl: string | null;
  attachmentPath: string | null;
  points: number;
  startAt: string | null;
  endAt: string | null;
  goal: string | null;
  submissionId: number | null;
  submissionStatus: 'GRADED' | 'SUBMITTED' | 'NOT_SUBMITTED' | string | null;
  score: number | null;
  totalPoints: number;
  fileUrl: string | null;
  uploadedFilePath: string | null;
  feedback: string | null;
  mentorId: number | null;
  mentorName: string | null;
  mentorPhoto: string | null;
}

export const getStudentProjectDetails = async (projectId: number): Promise<StudentProjectDetails> => {
  try {
    const raw = await handleRequest(api.get(`api/v1/project/${projectId}/student`));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof (data.apiResponse as Record<string, unknown>).data === 'object') {
      return (data.apiResponse as Record<string, unknown>).data as StudentProjectDetails;
    }
    return raw as StudentProjectDetails;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error("Get Student Project Details Error:", err?.response?.data ?? err?.message ?? error);
    throw error;
  }
};
