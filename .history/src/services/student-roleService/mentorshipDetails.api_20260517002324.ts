import { useQuery } from '@tanstack/react-query';
import api from '../api';
<<<<<<< HEAD
import { queryClient } from '../../lib/queryClient'; 
import type { MentorshipDetails, MentorshipDetailsApiResponse, MentorshipSummary, MentorshipContentResponse, Week } from '../../types/student-role-types/studentMentorshipTypes';
=======
import { queryClient } from '../../lib/queryClient';
import type { MentorshipDetails, MentorshipDetailsApiResponse, MentorshipSummary, MentorshipContentResponse, WeekContent, WeekContentResponse, Week, MentorshipOverviewApiResponse, MentorshipOverviewEnrolled } from '../../types/student-role-types/studentMentorshipTypes';
>>>>>>> Student-role

const baseUrl = import.meta.env.VITE_BASE_URL ?? '';

// Helper: Ensures URLs are absolute
const normalizeImageUrl = (value?: string | null): string | null => {
  if (!value || value.trim() === '') return null;
  if (value.startsWith('http')) return value;
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
};

// Map Summary (Used for "Top Mentorships" section)
const mapMentorshipSummary = (item: Record<string, unknown>): MentorshipSummary => {
  const price = Number(item.price ?? 0);
  const discountPercentage = Number(item.discountPercentage ?? 0);
  const priceAfterDiscount = Number(
    item.priceAfterDiscount ?? price * (1 - discountPercentage / 100)
  );

  return {
    id: Number(item.id ?? 0),
    title: String(item.title ?? 'Untitled Mentorship'),
    subtitle: String(item.subtitle ?? ''),
    description: String(item.description ?? ''),
    category: String(item.category ?? 'General'),
    mentorName: String(item.mentorName ?? 'Unknown Mentor'),
    price,
    discountPercentage,
    priceAfterDiscount,
    duration: Number(item.duration ?? 0),
    coverImageUrl: normalizeImageUrl(String(item.coverImageUrl ?? '')),
  };
};

<<<<<<< HEAD
// Map Full Details (Main Page Data)
=======
// Map details (unified mapper for both beforeEnroll and afterEnroll - core fields only)
>>>>>>> Student-role
const mapMentorshipDetails = (payload: Record<string, unknown>): MentorshipDetails => {
  const mentor = (payload.mentor ?? {}) as Record<string, unknown>;
  const tags = Array.isArray(payload.tags) ? payload.tags.map(String) : [];
  const whatWillLearn = Array.isArray(payload.whatWillLearn) ? payload.whatWillLearn.map(String) : [];

  const price = Number(payload.price ?? 0);
  const discountPercentage = Number(payload.discountPercentage ?? 0);
<<<<<<< HEAD
  // Using finalPrice as the source of truth if available, otherwise calculating
=======
>>>>>>> Student-role
  const finalPrice = Number(payload.finalPrice ?? price * (1 - discountPercentage / 100));

  const topMentorMentorships = Array.isArray(payload.topMentorMentorships)
    ? payload.topMentorMentorships.map((item) => mapMentorshipSummary(item as Record<string, unknown>))
    : [];

  return {
    id: Number(payload.id ?? 0),
    title: String(payload.title ?? 'Untitled Mentorship'),
    subtitle: String(payload.subtitle ?? ''),
    description: String(payload.description ?? ''),
    category: String(payload.category ?? 'General'),
    difficultyLevel: String(payload.difficultyLevel ?? 'Beginner'),
    duration: Number(payload.duration ?? 0),
    price,
    discountPercentage,
    finalPrice,
    coverImageUrl: normalizeImageUrl(String(payload.coverImageUrl ?? '')),
    status: String(payload.status ?? 'Available'),
    rating: payload.rating == null ? null : Number(payload.rating),
    mentorName: String(mentor.name ?? payload.mentorName ?? 'Mentor'),
    mentorEmail: String(mentor.email ?? payload.mentorEmail ?? ''),
    mentorProfileImageUrl: normalizeImageUrl(String(mentor.profileImageUrl ?? payload.mentorProfileImageUrl ?? '')),
    mentorJobTitle: String(mentor.jobTitle ?? payload.mentorJobTitle ?? 'Instructor'),
    mentorYearsOfExperience: Number(mentor.yearsOfExperience ?? payload.mentorYearsOfExperience ?? 0),
    tags,
    whatWillLearn,
    topMentorMentorships,
<<<<<<< HEAD
    thumnailUrls: [], // Can be mapped later if API provides it
    priceAfterDiscount: finalPrice // Syncing for consistency
  };
};

// Query Keys System
export const mentorshipDetailsKeys = {
  detail: (mentorshipId: string | number) => ['mentorshipDetails', mentorshipId] as const,
  content: (mentorshipId: string | number) => ['mentorshipContent', mentorshipId] as const,
=======
    thumnailUrls: [],
    priceAfterDiscount: finalPrice
  };
};



// Query Keys System
export const mentorshipDetailsKeys = {
  detail: (mentorshipId: string | number) => ['mentorshipDetails', mentorshipId] as const,
  overview: (mentorshipId: string | number) => ['mentorshipOverview', mentorshipId] as const,
  content: (mentorshipId: string | number) => ['mentorshipContent', mentorshipId] as const,
  weekContent: (weekId: string | number) => ['weekContent', weekId] as const,
>>>>>>> Student-role
};

// Fetch Function
export const fetchMentorshipDetails = async (
  mentorshipId: string | number,
  signal?: AbortSignal
): Promise<MentorshipDetails> => {
  // 🔍 DEBUG LOG: API fetch starting
  console.log('[DEBUG] fetchMentorshipDetails - ID:', mentorshipId, 'URL:', `/api/v1/student/mentorships/${mentorshipId}/overview`);

  const startTime = performance.now();
  const { data } = await api.get<MentorshipDetailsApiResponse>(
    `/api/v1/student/mentorships/${mentorshipId}/overview`,
    {
      params: {
        topMentorshipsLimit: 3,
        UpcomingPage: 0,
        UpcomingSize: 5,
      },
      signal,
    }
  );

  const endTime = performance.now();
  console.log('[DEBUG] API fetch complete in', (endTime - startTime).toFixed(2), 'ms');

  const mentorshipData = data?.apiResponse?.mentorship;
  let payload: Record<string, unknown> | null = null;

  // Try both beforeEnroll and afterEnroll (per API response structure)
  const beforeEnroll = mentorshipData?.beforeEnroll as Record<string, unknown> | undefined;
  const afterEnroll = (mentorshipData as Record<string, unknown> & { afterEnroll?: Record<string, unknown> })?.afterEnroll as Record<string, unknown> | undefined;
  
  payload = beforeEnroll && Object.keys(beforeEnroll).length > 0 
    ? beforeEnroll 
    : afterEnroll && Object.keys(afterEnroll).length > 0 
      ? afterEnroll 
      : null;

  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Mentorship details are not available.');
  }

  // Use appropriate mapper based on source (simplified, can detect by fields if needed)
  return mapMentorshipDetails(payload);
};

// Fetch Mentorship Overview (with enrollment status and progress/upcoming items)
export const fetchMentorshipOverview = async (
  mentorshipId: string | number,
  signal?: AbortSignal
): Promise<{ isEnrolled: boolean; afterEnroll: MentorshipOverviewEnrolled | null }> => {
  console.log('[DEBUG] fetchMentorshipOverview - ID:', mentorshipId, 'URL:', `/api/v1/student/mentorships/${mentorshipId}/overview`);

  const { data } = await api.get<MentorshipOverviewApiResponse>(
    `/api/v1/student/mentorships/${mentorshipId}/overview`,
    {
      params: {
        topMentorshipsLimit: 3,
        UpcomingPage: 0,
        UpcomingSize: 5,
      },
      signal,
    }
  );

  const mentorshipData = data?.apiResponse?.mentorship;
  const afterEnroll = mentorshipData?.afterEnroll as MentorshipOverviewEnrolled | null;
  const isEnrolled = afterEnroll !== null && afterEnroll !== undefined;

  return { isEnrolled, afterEnroll };
};

// Fetch Mentorship Content
export const fetchMentorshipContent = async (
  mentorshipId: string | number,
  signal?: AbortSignal
): Promise<{ weeks: Week[] } | { error: string }> => {
  console.log('[DEBUG] fetchMentorshipContent - ID:', mentorshipId, 'URL:', `/api/v1/student/week/${mentorshipId}/weeks-with-contents`);

  try {
    const { data } = await api.get<MentorshipContentResponse>(
      `/api/v1/student/week/${mentorshipId}/weeks-with-contents`,
      { signal }
    );

    return { weeks: data.apiResponse.weeks.weeks };
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          errorMessages?: {
            error?: string;
          };
        };
      };
    };

    if (err.response?.data?.errorMessages?.error === 'You are not enrolled in this mentorship') {
      return { error: 'You are not enrolled in this mentorship' };
    }

    throw error;
  }
};

// Custom Hook
export const useMentorshipDetails = (mentorshipId: number | string, enabled = true) => {
  console.log('[DEBUG] useMentorshipDetails called - mentorshipId:', mentorshipId, typeof mentorshipId, 'enabled:', enabled);

  return useQuery({
    queryKey: mentorshipDetailsKeys.detail(mentorshipId),
    queryFn: ({ signal }) => fetchMentorshipDetails(mentorshipId, signal),
    enabled: enabled && !!mentorshipId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
};

<<<<<<< HEAD
=======
// Custom Hook for Mentorship Overview (enrollment status + progress + upcoming items)
export const useMentorshipOverview = (mentorshipId: number | string, enabled = true) => {
  return useQuery({
    queryKey: mentorshipDetailsKeys.overview(mentorshipId),
    queryFn: ({ signal }) => fetchMentorshipOverview(mentorshipId, signal),
    enabled: enabled && !!mentorshipId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
};

>>>>>>> Student-role
// Custom Hook for Content
export const useMentorshipContent = (mentorshipId: number | string, enabled = true) => {
  return useQuery({
    queryKey: mentorshipDetailsKeys.content(mentorshipId),
    queryFn: ({ signal }) => fetchMentorshipContent(mentorshipId, signal),
    enabled: enabled && !!mentorshipId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
};

// Prefetching Logic
export const prefetchMentorshipDetails = async (mentorshipId: number | string) => {
  await queryClient.prefetchQuery({
    queryKey: mentorshipDetailsKeys.detail(mentorshipId),
    queryFn: ({ signal }) => fetchMentorshipDetails(mentorshipId, signal),
    staleTime: 5 * 60 * 1000,
  });
};

<<<<<<< HEAD
=======
export const fetchWeekContent = async (
  weekId: string | number,
  signal?: AbortSignal
): Promise<WeekContent> => {
  console.log('[DEBUG] fetchWeekContent - ID:', weekId, 'URL:', `/api/v1/student/week/${weekId}/contents`);

  const { data } = await api.get<WeekContentResponse>(
    `/api/v1/student/week/${weekId}/contents`,
    { signal }
  );

  return data.apiResponse.week;
};

export const useWeekContent = (weekId: number | string, enabled = true) => {
  return useQuery({
    queryKey: mentorshipDetailsKeys.weekContent(weekId),
    queryFn: ({ signal }) => fetchWeekContent(weekId, signal),
    enabled: enabled && !!weekId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
};

export const prefetchWeekContent = async (weekId: number | string) => {
  await queryClient.prefetchQuery({
    queryKey: mentorshipDetailsKeys.weekContent(weekId),
    queryFn: ({ signal }) => fetchWeekContent(weekId, signal),
    staleTime: 5 * 60 * 1000,
  });
};

>>>>>>> Student-role
export const prefetchMentorshipContent = async (mentorshipId: number | string) => {
  await queryClient.prefetchQuery({
    queryKey: mentorshipDetailsKeys.content(mentorshipId),
    queryFn: ({ signal }) => fetchMentorshipContent(mentorshipId, signal),
    staleTime: 5 * 60 * 1000,
  });
<<<<<<< HEAD
};
=======
};
>>>>>>> Student-role
