import api from '../api';
import { handleRequest } from './utils';

export interface CreateLecturePayload {
    weekId: number;
    title: string;
    lectureUrl: string;
}

export const createLecture = async (payload: CreateLecturePayload): Promise<unknown> => {
    const raw = await handleRequest(api.post<unknown>('/lectures', payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).lecture ?? data.apiResponse;
        return res;
    }
    return raw;
};

/** Delete a lecture by its ID */
export const deleteLecture = async (id: number): Promise<void> => {
    await handleRequest(api.delete<unknown>(`/lectures/${id}`));
};

/** Update a lecture by its ID */
export interface UpdateLecturePayload {
    title?: string;
    lectureUrl?: string;
}

export const updateLecture = async (id: number, payload: UpdateLecturePayload): Promise<unknown> => {
    const raw = await handleRequest(api.patch<unknown>(`/lectures/${id}`, payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).lecture ?? data.apiResponse;
        return res;
    }
    return raw;
};
