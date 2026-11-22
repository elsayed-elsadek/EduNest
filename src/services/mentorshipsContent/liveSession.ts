import api from '../api';
import { handleRequest } from './utils';

export interface LiveSessionTime {
    hour: number;
    minute: number;
    second?: number;
    nano?: number;
}

export interface CreateLiveSessionPayload {
    weekId: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: LiveSessionTime;
}

function toScheduledAt(date: string, time: LiveSessionTime | string): string {
    let timeString: string;
    if (typeof time === 'string') {
        const [hour = '', minute = '', second = '00'] = time.split(':');
        timeString = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
    } else {
        const hh = String(time.hour).padStart(2, '0');
        const mm = String(time.minute).padStart(2, '0');
        const ss = String(time.second ?? 0).padStart(2, '0');
        timeString = `${hh}:${mm}:${ss}`;
    }
    return `${date}T${timeString}`;
}

/**
 * دالة إنشاء جلسة بث مباشر
 */
export const createLiveSession = async (payload: CreateLiveSessionPayload): Promise<unknown> => {
    const body = {
        title: payload.title,
        scheduledAt: toScheduledAt(payload.date, payload.time),
        weekId: payload.weekId,
    };

    const raw = await handleRequest(api.post<unknown>('api/v1/liveSession/create', body));
    return raw;
};

/** Delete a live session by its ID */
export const deleteLiveSession = async (sessionId: number): Promise<void> => {
    await handleRequest(api.delete<unknown>(`api/v1/liveSession/delete/${sessionId}`));
};

export interface MentorshipPaginatedItems<T = unknown> {
    currentPage: number;
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface LiveSession {
    id: number;
    title: string;
    mentorshipTitle: string;
    weekTitle: string;
    sessionStartDate: string;
}

export interface LiveSessionsResponse {
    apiResponse: {
        "Sessions fetched successfully": MentorshipPaginatedItems<LiveSession>;
    };
}

/** Get all live sessions for a specific mentorship */
export const getAllLiveSessionsForMentorship = async (
    mentorshipId: string,
    page: number = 0,
    size: number = 5
): Promise<MentorshipPaginatedItems<LiveSession>> => {
    const raw = await handleRequest(
        api.get<LiveSessionsResponse>('api/v1/liveSession/mentorship', {
            params: { mentorshipId, page, size },
        })
    );
    const data = raw as LiveSessionsResponse;

    return data.apiResponse["Sessions fetched successfully"];
};

/** Update a live session by its ID */
export interface UpdateLiveSessionPayload {
    title?: string;
    date?: string;
    time?: LiveSessionTime | string; // Can be object or time string "HH:mm:ss"
    scheduledAt?: string;
}

export const updateLiveSession = async (sessionId: number | string, payload: UpdateLiveSessionPayload): Promise<unknown> => {
    const body: { title?: string; scheduledAt?: string } = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.scheduledAt !== undefined) {
        body.scheduledAt = payload.scheduledAt;
    } else if (payload.date !== undefined && payload.time !== undefined) {
        body.scheduledAt = toScheduledAt(payload.date, payload.time);
    }

    const raw = await handleRequest(api.patch<unknown>(`api/v1/liveSession/update/${sessionId}`, body));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).session ?? data.apiResponse;
        return res;
    }
    return raw;
};

// --- New Live Session Endpoints ---

export interface SessionActionResponse {
    apiResponse: Record<string, LiveSessionInfo>;
}

export interface LiveSessionInfo {
    sessionId: number;
    sessionTitle: string;
    sessionStartDate: string;
    sessionStatus: string; // 'LIVE', 'ENDED', etc.
    meetingUrl: string;
}

/**
 * Start a live session by session ID
 */
export const startLiveSession = async (sessionId: number): Promise<LiveSessionInfo> => {
    const raw = await handleRequest(api.post<SessionActionResponse>(`api/v1/liveSession/start/${sessionId}`));
    const data = raw as SessionActionResponse;
    const responseKey = Object.keys(data.apiResponse)[0];
    return data.apiResponse[responseKey];
};

/**
 * End an ongoing live session by session ID
 */
export const endLiveSession = async (sessionId: number): Promise<LiveSessionInfo> => {
    const raw = await handleRequest(api.post<SessionActionResponse>(`api/v1/liveSession/end/${sessionId}`));
    const data = raw as SessionActionResponse;
    const responseKey = Object.keys(data.apiResponse)[0];
    return data.apiResponse[responseKey];
};

/**
 * Join a live session using session ID
 */
export const joinLiveSession = async (sessionId: number): Promise<LiveSessionInfo> => {
    // Expected to return meeting info if LIVE, might throw error if ended
    const raw = await handleRequest(api.get<SessionActionResponse>(`api/v1/liveSession/join/${sessionId}`));
    const data = raw as SessionActionResponse;
    const responseKey = Object.keys(data.apiResponse)[0];
    return data.apiResponse[responseKey];
};
