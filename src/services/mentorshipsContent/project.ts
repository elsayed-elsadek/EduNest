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

export const createProject = async (
    payload: CreateProjectPayload,
    attachmentFile?: File
): Promise<unknown> => {
    const formData = new FormData();

    const jsonBody = {
        weekId: Number(payload.weekId),
        title: payload.title,
        goal: payload.goal,
        brief: payload.brief,
        descriptionUrl: payload.descriptionUrl?.trim() || null,
        startAt: payload.startAt,
        endAt: payload.endAt,
        points: Number(payload.points),
        status: payload.status ?? 'DRAFT'
    };

    const jsonBlob = new Blob([JSON.stringify(jsonBody)], {
        type: 'application/json'
    });

    formData.append("req", jsonBlob);

    if (attachmentFile) {
        formData.append("attachment", attachmentFile);
    }

    const raw = await handleRequest(
        api.post<unknown>('api/v1/project', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    );

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

export const updateProject = async (
    id: number,
    payload: UpdateProjectPayload
): Promise<unknown> => {
    const formData = new FormData();

    const jsonBody = {
        title: payload.title,
        goal: payload.goal,
        brief: payload.brief,
        descriptionUrl: payload.descriptionUrl,
        startAt: payload.startAt,
        endAt: payload.endAt,
        points: payload.points,
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
        api.patch<unknown>(`api/v1/project/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    );

    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).project ?? data.apiResponse;
        return res;
    }
    return raw;
};
