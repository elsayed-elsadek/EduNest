import api from '../api';
import { handleRequest } from './utils';

export interface CreateProjectPayload {
    weekId: number;
    title: string;
    goal: string;
    brief: string;
    descriptionUrl?: string;
    startAt: string; // ISO date
    endAt: string;
    points: number;
    status?: 'DRAFT' | 'PUBLISHED';
}

export const createProject = async (payload: CreateProjectPayload): Promise<unknown> => {
    // التأكد من تحويل القيم التي قد تأتي من الـ Inputs كنصوص إلى أرقام
    const body = {
        weekId: Number(payload.weekId),
        title: payload.title,
        goal: payload.goal,
        brief: payload.brief,
        descriptionUrl: payload.descriptionUrl?.trim() || '',
        startAt: payload.startAt,
        endAt: payload.endAt,
        points: Number(payload.points),
        status: payload.status ?? 'DRAFT'
    };

    console.log("Submitting Project Payload:", body); // راقب القيم في الكونسول

    const raw = await handleRequest(api.post<unknown>('api/v1/project', body));

    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).project ?? data.apiResponse;
        return res;
    }
    return raw;
};

/** Delete a project by its ID */
export const deleteProject = async (id: number): Promise<void> => {
    await handleRequest(api.delete<unknown>(`api/v1/project/${id}`));
};

/** Update a project by its ID */
export interface UpdateProjectPayload {
    title?: string;
    goal?: string;
    brief?: string;
    descriptionUrl?: string;
    startAt?: string;
    endAt?: string;
    points?: number;
    status?: 'DRAFT' | 'PUBLISHED';
}

export const updateProject = async (id: number, payload: UpdateProjectPayload): Promise<unknown> => {
    const raw = await handleRequest(api.patch<unknown>(`api/v1/project/${id}`, payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).project ?? data.apiResponse;
        return res;
    }
    return raw;
};
