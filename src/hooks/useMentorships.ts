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
    queryFn: () => getMentorships(page, size),
    // Override staleTime for this specific query (optional)
    // staleTime: 2 * 60 * 1000, // 2 minutes
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
 * Can be used in components for data transformation
 */
export function mapApiMentorshipToUi(item: unknown): Mentorship {
  const m = item as Record<string, unknown>;
  const status = String(m.status ?? 'DRAFT').toUpperCase();

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
    icon: '📋',
    coverImageUrl: (typeof m.coverImageUrl === 'string' ? m.coverImageUrl : null),
    level: String(m.difficultyLevel ?? m.level ?? 'ALL_LEVEL'),
    rating: Number(m.rating ?? 0),
    totalEnrolled: Number(m.totalEnrolled ?? m.enrolledCount ?? m.students ?? 0),
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
  
  const transformedData = data?.content?.map(mapApiMentorshipToUi) ?? [];
  
  return {
    ...rest,
    data: {
      ...data,
      content: transformedData,
    },
  };
}

