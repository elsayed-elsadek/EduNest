import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMentorships, deleteMentorship } from '../services/mentorDashboardService';
import { queryKeys } from '../lib/queryClient';
import type { Mentorship } from '../types/mentorship.types';

/**
 * Custom hook for fetching mentorships with React Query
 * Provides caching, retry logic, and stale-while-revalidate
 */
export function useMentorships(page = 0, size = 5) {
  return useQuery({
    queryKey: [...queryKeys.mentorships, page, size],
    queryFn: () => getMentorships(page, size, undefined),
  });
}

/**
 * Hook for deleting a mentorship with automatic cache invalidation
 */
export function useDeleteMentorship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMentorship(id),
    onSuccess: () => {
      // Invalidate mentorships cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorships });
    },
  });
}

/**
 * Helper function to transform API response to UI model
 */
export function mapApiMentorshipToUi(item: unknown): Mentorship {
  const m = item as Record<string, unknown>;
  const statusRaw = m.status ?? m.mentorshipStatus;
  const status = String(statusRaw ?? 'DRAFT').toUpperCase();

  const uiStatus =
    status === 'ACTIVE' || status === 'PUBLISHED' ? 'active' :
      status === 'DRAFT' ? 'draft' :
        status === 'COMPLETED' ? 'completed' :
          'draft';

  const created = m.createdAt ?? m.createdDate ?? m.created_at ?? m.uploadDate ?? new Date().toISOString();
  const dateStr = typeof created === 'string'
    ? new Date(created).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return {
    id: String(m.id ?? ''),
    title: String(m.title ?? 'Untitled'),
    icon: 'clipboard',
    coverImageUrl: (typeof m.coverImageUrl === 'string' ? m.coverImageUrl : null),
    level: String(m.difficultyLevel ?? m.level ?? 'ALL_LEVEL'),
    rating: Number(m.rating ?? 0),
    totalEnroll: Number(m.totalEnroll ?? m.enrolledCount ?? m.students ?? 0),
    revenue: Number(m.price ?? m.revenue ?? 0),
    createdDate: dateStr,
    status: uiStatus,
  };
}

/**
 * Optimized version of useMentorships with transformed data
 */
export function useMentorshipsWithTransform(page = 0, size = 5) {
  const { data, ...rest } = useMentorships(page, size);
  
  // معالجة شكل البيانات المتداخل القادم من الـ API
  // data.apiResponse.mentorships أو data مباشرة
  const rawData = (data as any)?.apiResponse?.mentorships ?? data;
  const transformedData = rawData?.content?.map(mapApiMentorshipToUi) ?? [];
  
  return {
    ...rest,
    data: {
      ...rawData,
      content: transformedData,
    },
  };
}