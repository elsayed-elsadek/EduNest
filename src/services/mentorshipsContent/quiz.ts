import api from '../api';
import { handleRequest } from './utils';

export interface CreateQuizPayload {
    weekId: number;
    title: string;
    description?: string;
    durationMinutes: number;
    status?: 'DRAFT' | 'PUBLISHED';
}

export const createQuiz = async (payload: CreateQuizPayload): Promise<unknown> => {
    const body = { ...payload, status: payload.status ?? 'DRAFT' };
    const raw = await handleRequest(api.post<unknown>('api/v1/quiz', body));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).quiz ?? data.apiResponse;
        return res;
    }
    return raw;
};

/** Delete a quiz by its ID */
export const deleteQuiz = async (id: number): Promise<void> => {
    await handleRequest(api.delete<unknown>(`api/v1/quiz/${id}`));
};

/** Update a quiz by its ID */
export interface UpdateQuizPayload {
    title?: string;
    description?: string;
    durationMinutes?: number;
    status?: 'DRAFT' | 'PUBLISHED';
}

export const updateQuiz = async (id: number, payload: UpdateQuizPayload): Promise<unknown> => {
    const raw = await handleRequest(api.patch<unknown>(`api/v1/quiz/${id}`, payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).quiz ?? data.apiResponse;
        return res;
    }
    return raw;
};
