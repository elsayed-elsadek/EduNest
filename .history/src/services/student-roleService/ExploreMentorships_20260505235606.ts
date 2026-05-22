import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api, { API_BASE_URL } from '../api';
import type { MentorshipResponse, MentorshipFiltersType } from '../../types/mentorship';

// BASE_URL now loaded from .env

/**
 * Query Keys Factory
 */
export const mentorshipKeys = {
  all: ['mentorships'] as const,
  list: (filters: MentorshipFiltersType) => [...mentorshipKeys.all, { ...filters }] as const,
};

/**
 * Fetch all mentorship programs
 */
export const fetchMentorships = async (
  filters: MentorshipFiltersType = {},
  signal?: AbortSignal
): Promise<MentorshipResponse> => {
  // Validate inputs
  if (filters.page !== undefined && (filters.page < 0 || filters.page > 1000)) {
    throw new Error('Invalid page number');
  }
  if (filters.size !== undefined && (filters.size <= 0 || filters.size > 100)) {
    throw new Error('Invalid page size');
  }
  if (filters.minPrice !== undefined && filters.minPrice < 0) {
    throw new Error('Min price cannot be negative');
  }
  if (filters.maxPrice !== undefined && filters.maxPrice < 0) {
    throw new Error('Max price cannot be negative');
  }
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice) {
    throw new Error('Min price cannot exceed max price');
  }

  const params = {
    page: filters.page ?? 0,
    size: filters.size ?? 5,
    keyword: filters.keyword || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };

  const { data } = await api.get<MentorshipResponse>('/api/v1/mentorship/explore', {
    params,
    signal, 
  });

  //  Transform Logic: تعديل روابط الصور فور استلامها
  if (data?.apiResponse?.mentorShips?.content) {
    data.apiResponse.mentorShips.content = data.apiResponse.mentorShips.content.map(mentorship => {
      let imageUrl = `${mentorship.coverImageUrl}`;

      // لو المسار موجود ومش بيبدأ بـ http، ندمجه مع الـ BASE_URL
      if (imageUrl && !imageUrl.startsWith('http')) {
        // const baseUrl = API_BASE_URL || '';
        imageUrl = `${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      return {
        ...mentorship,
        coverImageUrl: imageUrl // الآن المسار كامل وشغال 100%
      };
    });
  }

  return data;
};

/**
 * React Query hook
 */
export const useMentorships = (filters: MentorshipFiltersType = {}) => {
  return useQuery({
    queryKey: mentorshipKeys.list(filters),
    queryFn: ({ signal }) => fetchMentorships(filters, signal),
    staleTime: 5 * 60 * 1000, 
    gcTime: 30 * 60 * 1000, 
    placeholderData: keepPreviousData, 
    retry: 2,
  });
};