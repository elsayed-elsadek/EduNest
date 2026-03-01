import api from '../api';
import { handleRequest } from './utils';

export interface CreateWeekPayload {
    mentorshipId: number;
    title: string;
}

export interface WeekResponse {
    id: number;
    title?: string;
    [key: string]: unknown;
}

export const createWeek = async (payload: CreateWeekPayload): Promise<WeekResponse> => {
    const raw = await handleRequest(api.post<unknown>('api/v1/week/create', payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).week ?? data.apiResponse;
        return res as WeekResponse;
    }
    if (data && typeof data.id === 'number') return data as WeekResponse;
    return raw as WeekResponse;
};

/** Delete a week (module) by its ID */
export const deleteWeek = async (id: number): Promise<void> => {
    await handleRequest(api.delete<unknown>(`api/v1/week/${id}`));
};

/** Update a week (module) title */
export const updateWeekTitle = async (id: number, title: string): Promise<WeekResponse> => {
    const raw = await handleRequest(api.patch<unknown>(`api/v1/week/${id}`, { title }));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const apiRes = data.apiResponse as Record<string, unknown>;
        const week = (apiRes.week as Record<string, unknown> | undefined) ?? apiRes;
        return week as WeekResponse;
    }
    if (data && typeof data.id === 'number') return data as WeekResponse;
    return raw as WeekResponse;
};

/** Get all weeks for a specific mentorship */
export const getWeeksByMentorship = async (mentorshipId: number): Promise<WeekResponse[]> => {
    // Backend docs: GET /api/v1/week/{mentorshipId}/weeks
    const url = `api/v1/week/${mentorshipId}/weeks`;
    console.log("🔍 Fetching weeks from URL:", url);

    const raw = await handleRequest(api.get<unknown>(url));
    console.log("RAW RESPONSE 👉", raw);
    console.log("📊 Response type:", typeof raw);
    console.log("📊 Is Array?", Array.isArray(raw));

    if (Array.isArray(raw)) {
        console.log("✅ Raw is array, filtering...");
        return (raw as unknown[]).filter((w) => w && typeof w === 'object') as WeekResponse[];
    }

    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const apiRes = data.apiResponse as Record<string, unknown>;
        console.log("✅ Found apiResponse:", apiRes);
        console.log("🔎 apiRes.weeks type:", typeof apiRes.weeks, "isArray:", Array.isArray(apiRes.weeks));

        if (Array.isArray(apiRes.weeks)) {
            const weeks = apiRes.weeks as unknown[];
            console.log("✅ Found weeks array with", weeks.length, "items");
            console.log("🔎 First week:", weeks[0]);
            console.log("🔎 Weeks before filter:", weeks);
            const filtered = weeks.filter((w) => w && typeof w === 'object');
            console.log("🔎 Weeks after filter:", filtered);
            return filtered as WeekResponse[];
        }
        if (Array.isArray(apiRes.content)) {
            console.log("✅ Found content array with", apiRes.content.length, "items");
            return (apiRes.content as unknown[]).filter((w) => w && typeof w === 'object') as WeekResponse[];
        }
    }

    const possibleKeys = ['weeks', 'content', 'items', 'results'];
    for (const key of possibleKeys) {
        if (Array.isArray(data?.[key])) {
            console.log("✅ Found", key, "array with", (data[key] as unknown[]).length, "items");
            return (data[key] as unknown[]).filter((w) => w && typeof w === 'object') as WeekResponse[];
        }
    }

    console.log("❌ No weeks found!");
    return [];
};

// --- Week contents ---
export interface WeekContentItem {
    id?: number;
    title?: string;
    type?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export const getWeekContents = async (weekId: number): Promise<WeekContentItem[]> => {
    // Backend docs: GET /api/v1/week/{weekId}/contents
    const raw = await handleRequest(api.get<unknown>(`api/v1/week/${weekId}/contents`));

    if (Array.isArray(raw)) {
        return (raw as unknown[]).filter((c) => c && typeof c === 'object') as WeekContentItem[];
    }

    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const apiRes = data.apiResponse as Record<string, unknown>;

        // Handle the specific structure from user's example: { apiResponse: { week: { items: [] } } }
        const week = apiRes.week as { items?: unknown[] };
        if (week?.items && Array.isArray(week.items)) {
            return week.items.filter((c) => c && typeof c === 'object') as WeekContentItem[];
        }

        const keys = ['contents', 'content', 'items', 'results'];
        for (const key of keys) {
            if (Array.isArray(apiRes[key])) {
                return (apiRes[key] as unknown[]).filter((c) => c && typeof c === 'object') as WeekContentItem[];
            }
        }
    }

    const keys = ['contents', 'content', 'items', 'results'];
    for (const key of keys) {
        if (Array.isArray(data?.[key])) {
            return (data[key] as unknown[]).filter((c) => c && typeof c === 'object') as WeekContentItem[];
        }
    }

    return [];
};
