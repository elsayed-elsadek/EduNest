import api from '../api';
import { handleRequest } from './request';
import type { MentorshipApiResponse, CreateMentorshipResult, MentorshipsPageResponse } from './types';
import { ApiValidationError } from './types';
import { getValidationFieldErrors } from './validation';
import { extractMentorshipsData } from './extractors';

/** GET /api/v1/mentorship with pagination (page 0-based, size = page size) */
export function getMentorships(page = 0, size = 5): Promise<MentorshipsPageResponse> {
  return handleRequest(api.get<unknown>('api/v1/dashboard/mentorships', { params: { page, size } })).then((raw) => {
    if (!raw || typeof raw !== 'object') {
      return { content: [], page: 0, size, totalElements: 0, totalPages: 0 };
    }
    const data = raw as Record<string, unknown>;
    const apiRes = data.apiResponse as Record<string, unknown> | undefined;
    const mentorShips = (apiRes?.mentorShips ?? apiRes?.mentorships) as Record<string, unknown> | undefined;
    if (!mentorShips || typeof mentorShips !== 'object') {
      const arr = extractMentorshipsData(raw);
      return {
        content: arr,
        page: 0,
        size: arr.length,
        totalElements: arr.length,
        totalPages: 1,
      };
    }
    const content = Array.isArray(mentorShips.content) ? mentorShips.content : [];
    return {
      content,
      page: Number(mentorShips.page ?? 0),
      size: Number(mentorShips.size ?? size),
      totalElements: Number(mentorShips.totalElements ?? content.length),
      totalPages: Number(mentorShips.totalPages ?? 1),
    };
  });
}

/** Fetch single mentorship by ID (tries common endpoint shapes) */
export async function getMentorshipDetail(mentorshipId: string | number): Promise<MentorshipApiResponse> {
  const id = String(mentorshipId);
  const candidates = [
    `api/v1/mentorship/${id}`,
    `api/v1/mentorships/${id}`,
    `api/v1/dashboard/mentorships/${id}`,
  ];

  const errors: Array<{ url: string; status?: number; data?: unknown; message?: string }> = [];

  for (const url of candidates) {
    try {
      const response = await api.get<unknown>(url);
      const raw = response.data as Record<string, unknown> | null;

      if (!raw) return raw as unknown as MentorshipApiResponse;

      if (raw.apiResponse && typeof raw.apiResponse === 'object') {
        const apiRes = raw.apiResponse as Record<string, unknown>;
        if (apiRes.mentorShip && typeof apiRes.mentorShip === 'object') {
          return apiRes.mentorShip as MentorshipApiResponse;
        }
        if (apiRes.mentorship && typeof apiRes.mentorship === 'object') {
          return apiRes.mentorship as MentorshipApiResponse;
        }
      }

      if (raw.mentorShip && typeof raw.mentorShip === 'object') {
        return raw.mentorShip as MentorshipApiResponse;
      }
      if (raw.mentorship && typeof raw.mentorship === 'object') {
        return raw.mentorship as MentorshipApiResponse;
      }

      if ('id' in raw && ('title' in raw || 'description' in raw)) {
        return raw as MentorshipApiResponse;
      }

      return raw as unknown as MentorshipApiResponse;
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string };
      errors.push({ url, status: e.response?.status, data: e.response?.data, message: e.message });
    }
  }

  const first = errors[0];
  const msg = `Failed to load mentorship (${id}). Last error: ${first?.status ?? 'unknown'} ${JSON.stringify(first?.data ?? first?.message)}`;
  throw new Error(msg);
}

/** Create a new mentorship */
export async function createMentorship(data: Partial<MentorshipApiResponse>): Promise<CreateMentorshipResult> {
  try {
    const response = await api.post<unknown>('api/v1/mentorship', data);
    const raw = response.data as Record<string, unknown> | null;

    if (!raw) {
      return { mentorship: null, message: undefined };
    }

    if (raw.apiResponse && typeof raw.apiResponse === 'object') {
      const apiRes = raw.apiResponse as Record<string, unknown>;
      const mentorship =
        (apiRes.mentorship as MentorshipApiResponse | undefined) ||
        (apiRes.mentorShip as MentorshipApiResponse | undefined) ||
        null;
      const message = (apiRes.message as string | undefined) ?? (raw.message as string | undefined);
      return { mentorship, message };
    }

    if (raw.mentorship && typeof raw.mentorship === 'object') {
      return {
        mentorship: raw.mentorship as MentorshipApiResponse,
        message: (raw.message as string | undefined) ?? undefined,
      };
    }
    if (raw.mentorShip && typeof raw.mentorShip === 'object') {
      return {
        mentorship: raw.mentorShip as MentorshipApiResponse,
        message: (raw.message as string | undefined) ?? undefined,
      };
    }

    if ('id' in raw && ('title' in raw || 'description' in raw)) {
      return { mentorship: raw as unknown as MentorshipApiResponse, message: raw.message as string | undefined };
    }

    return { mentorship: null, message: raw.message as string | undefined };
  } catch (error) {
    const fieldErrors = getValidationFieldErrors(error);
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const firstMessage = Object.values(fieldErrors)[0] ?? 'Validation failed';
      throw new ApiValidationError(firstMessage, fieldErrors);
    }
    throw error;
  }
}

/** Update an existing mentorship */
export async function updateMentorship(
  mentorshipId: string | number,
  data: Partial<MentorshipApiResponse>
): Promise<MentorshipApiResponse> {
  try {
    // Most backends use the same base path as create/delete: /api/v1/mentorship/{id}
    const response = await api.patch<unknown>(`api/v1/mentorship/${mentorshipId}`, data);
    const raw = response.data as Record<string, unknown> | null;

    // Try common wrapper shapes first
    if (raw && typeof raw === 'object') {
      const apiRes = raw.apiResponse as Record<string, unknown> | undefined;
      const mentorship =
        (apiRes?.mentorship as MentorshipApiResponse | undefined) ||
        (apiRes?.mentorShip as MentorshipApiResponse | undefined) ||
        (raw.mentorship as MentorshipApiResponse | undefined) ||
        (raw.mentorShip as MentorshipApiResponse | undefined);

      if (mentorship && typeof mentorship === 'object') return mentorship;
    }

    // Fallback: return whatever the API returned
    return response.data as MentorshipApiResponse;
  } catch (error) {
    const fieldErrors = getValidationFieldErrors(error);
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const firstMessage = Object.values(fieldErrors)[0] ?? 'Validation failed';
      throw new ApiValidationError(firstMessage, fieldErrors);
    }
    throw error;
  }
}

/** Delete a mentorship */
export async function deleteMentorship(mentorshipId: string | number): Promise<void> {
  await api.delete(`api/v1/mentorship/${mentorshipId}`);
}

/** Change mentorship cover image */
export async function changeMentorshipCoverImage(
  mentorshipId: string | number,
  imageFile: File
): Promise<{ Image_URL: string }> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<unknown>(`api/v1/mentorship/${mentorshipId}/change-cover-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const raw = response.data as Record<string, unknown> | null;
    if (raw && typeof raw === 'object') {
      const apiRes = raw.apiResponse as Record<string, unknown> | undefined;
      // Depending on the actual response format, try getting Image_URL
      if (apiRes && apiRes.Image_URL) {
        return { Image_URL: apiRes.Image_URL as string };
      }
      if (raw.Image_URL) {
        return { Image_URL: raw.Image_URL as string };
      }
    }

    throw new Error('Failed to change cover image. Invalid response format.');
  } catch (error) {
    const fieldErrors = getValidationFieldErrors(error);
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const firstMessage = Object.values(fieldErrors)[0] ?? 'Validation failed';
      throw new ApiValidationError(firstMessage, fieldErrors);
    }
    throw error;
  }
}
