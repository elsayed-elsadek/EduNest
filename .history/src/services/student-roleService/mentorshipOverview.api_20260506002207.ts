import { useQuery } from '@tanstack/react-query';
import api from '../api';
import type {
  MentorshipOverviewApiResponse,
  MentorshipOverviewEnrolled,
} from '../../types/student-role-types/studentMentorshipTypes';

const baseUrl = import.meta.env.VITE_BASE_URL ?? '';

// Helper: Ensures URLs are absolute
const normalizeImageUrl = (value?: string | null): string | null => {
  if (!value || value.trim() === '') return null;
  if (value.startsWith('http')) return value;
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
};

// Map Overview Data
const mapMentorshipOverview = (payload: Record<string, unknown>): MentorshipOverviewEnrolled => {
  const tags = Array.isArray(payload.tags) ? payload.tags.map(String) : [];
  const whatWillLearn = Array.isArray(payload.whatWillLearn) ? payload.whatWillLearn.map(String) : [];

  const progress = (payload.progress ?? {}) as Record<string, unknown>;
  const upcomingItems = (payload.upcomingItems ?? {}) as Record<string, unknown>;

  return {
    id: Number(payload.id ?? 0),
    title: String(payload.title ?? 'Untitled Mentorship'),
    subtitle: String(payload.subtitle ?? ''),
    description: String(payload.description ?? ''),
    category: String(payload.category ?? 'General'),
    coverImageUrl: normalizeImageUrl(String(payload.coverImageUrl ?? '')),
    whatWillLearn,
    tags,
    mentorName: String(payload.mentorName ?? 'Mentor'),
    mentorEmail: String(payload.mentorEmail ?? ''),
    mentorProfileImageUrl: normalizeImageUrl(String(payload.mentorProfileImageUrl ?? '')),
    mentorJobTitle: String(payload.mentorJobTitle ?? ''),
    mentorYearsOfExperience: Number(payload.mentorYearsOfExperience ?? 0),
    progress: {
      totalTasks: Number(progress.totalTasks ?? 0),
      completedTasks: Number(progress.completedTasks ?? 0),
      totalQuizzes: Number(progress.totalQuizzes ?? 0),
      completedQuizzes: Number(progress.completedQuizzes ?? 0),
      totalProjects: Number(progress.totalProjects ?? 0),
      completedProjects: Number(progress.completedProjects ?? 0),
      progressPercentage: Number(progress.progressPercentage ?? 0),
    },
    upcomingItems: {
      content: Array.isArray(upcomingItems.content)
        ? upcomingItems.content.map((item: Record<string, unknown>) => ({
            id: Number(item.id ?? 0),
            title: String(item.title ?? ''),
            type: String(item.type ?? 'SESSION'),
            dueDate: String(item.dueDate ?? ''),
            mentorshipId: Number(item.mentorshipId ?? 0),
            mentorshipTitle: String(item.mentorshipTitle ?? ''),
            weekId: Number(item.weekId ?? 0),
            weekTitle: String(item.weekTitle ?? ''),
            points: item.points == null ? null : Number(item.points),
          }))
        : [],
      page: Number(upcomingItems.page ?? 0),
      size: Number(upcomingItems.size ?? 5),
      totalElements: Number(upcomingItems.totalElements ?? 0),
      totalPages: Number(upcomingItems.totalPages ?? 0),
    },
  };
};

// Query Keys
export const mentorshipOverviewKeys = {
  detail: (mentorshipId: string | number) => ['mentorshipOverview', mentorshipId] as const,
};

// Fetch Function
export const fetchMentorshipOverview = async (
  mentorshipId: string | number,
  signal?: AbortSignal
): Promise<MentorshipOverviewEnrolled> => {
  console.log('[DEBUG] fetchMentorshipOverview - ID:', mentorshipId);

  const startTime = performance.now();
  const { data } = await api.get<MentorshipOverviewApiResponse>(
    `/api/v1/student/mentorships/${mentorshipId}/overview`,
    {
      params: {
        topMentorshipsLimit: 0, // Don't fetch top mentorships for overview
        UpcomingPage: 0,
        UpcomingSize: 5,
      },
      signal,
    }
  );

  const endTime = performance.now();
  console.log('[DEBUG] API fetch complete in', (endTime - startTime).toFixed(2), 'ms');

  // Check if student is enrolled (afterEnroll data exists)
  const afterEnrollData = data?.apiResponse?.mentorship?.afterEnroll as Record<string, unknown> | null;

  if (!afterEnrollData) {
    throw new Error('Mentorship overview not found. You may not be enrolled in this mentorship.');
  }

  return mapMentorshipOverview(afterEnrollData);
};

// React Query Hook
export const useMentorshipOverview = (mentorshipId: string | number, enabled = true) => {
  return useQuery({
    queryKey: mentorshipOverviewKeys.detail(mentorshipId),
    queryFn: ({ signal }) => fetchMentorshipOverview(mentorshipId, signal),
    enabled: enabled && Number.isFinite(Number(mentorshipId)) && Number(mentorshipId) > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
