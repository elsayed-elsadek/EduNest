import api from '../api';
import { handleRequest } from './utils';

export interface CreateTaskPayload {
    title: string;
    weekId: number;
    description?: string;
    points: number;
    passPoints: number;
    estimatedMinutes?: number;
    dueAt?: string; // ISO string expected
    attachmentUrl?: string;
    status?: 'DRAFT' | 'PUBLISHED';
}

export const createTask = async (payload: CreateTaskPayload): Promise<unknown> => {
    // Backend requires ALL fields to be present in the JSON body
    const body = {
        title: payload.title,
        weekId: Number(payload.weekId),
        description: payload.description?.trim() || 'No description',
        points: Number(payload.points),
        passPoints: Number(payload.passPoints),
        estimatedMinutes: payload.estimatedMinutes !== undefined ? Number(payload.estimatedMinutes) : 0,
        dueAt: payload.dueAt || '',
        attachmentUrl: payload.attachmentUrl?.trim() || '',
        status: payload.status ?? 'DRAFT',
    };

    console.log('Task payload:', JSON.stringify(body));

    const raw = await handleRequest(api.post<unknown>('api/v1/task', body));
    return raw;
};

/** Delete a task by its ID */
export const deleteTask = async (id: number): Promise<void> => {
    await handleRequest(api.delete<unknown>(`api/v1/task/${id}`));
};

/** Update a task by its ID */
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

export const updateTask = async (id: number, payload: UpdateTaskPayload): Promise<unknown> => {
    const raw = await handleRequest(api.patch<unknown>(`api/v1/task/${id}`, payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).task ?? data.apiResponse;
        return res;
    }
    return raw;
};
