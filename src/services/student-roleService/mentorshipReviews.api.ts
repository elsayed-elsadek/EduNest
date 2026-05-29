
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const baseUrl = import.meta.env.VITE_BASE_URL?.replace(/\/+$/, '') ?? '';

const normalizeImageUrl = (value?: string | null): string | null => {
  if (!value || String(value).trim() === '') return null;
  const url = String(value).trim();
  if (url.startsWith('http')) return url;
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export interface MentorshipReview {
  reviewId: number;
  studentEmail: string;
  rating: number;
  feedback: string;
  studentFullName: string;
  studentProfileImageUrl: string | null;
}

export interface MentorshipReviewsPage {
  content: MentorshipReview[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MentorshipReviewsApiResponse {
  apiResponse: {
    reviews: MentorshipReviewsPage;
    avgRating: number;
    message: string;
  };
}

export interface RateMentorshipPayload {
  rating: number;
  feedback: string;
}

export interface RateMentorshipApiResponse {
  apiResponse: {
    message: string;
  };
}

const mapReview = (item: Record<string, unknown>): MentorshipReview => ({
  reviewId: Number(item.reviewId ?? item.id ?? 0),
  studentEmail: String(item.studentEmail ?? ''),
  rating: Number(item.rating ?? 0),
  feedback: String(item.feedback ?? item.review ?? ''),
  studentFullName: String(item.studentFullName ?? item.studentName ?? 'Student'),
  studentProfileImageUrl: normalizeImageUrl(
    String(item.studentProfileImageUrl ?? '') || null
  ),
});

export const fetchMentorshipReviews = async (
  mentorshipId: string | number,
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<{ reviewsPage: MentorshipReviewsPage; avgRating: number }> => {
  const { data } = await api.get<MentorshipReviewsApiResponse>(
    `/api/v1/student/mentorships/${mentorshipId}/reviews`,
    {
      params: { page, size },
      signal,
    }
  );

  const reviews = data?.apiResponse?.reviews;
  const avgRating = Number(data?.apiResponse?.avgRating ?? 0);

  return {
    reviewsPage: {
      content: Array.isArray(reviews?.content)
        ? reviews.content.map((item) =>
            mapReview(item as unknown as Record<string, unknown>)
          )
        : [],
      page: Number(reviews?.page ?? page),
      size: Number(reviews?.size ?? size),
      totalElements: Number(reviews?.totalElements ?? 0),
      totalPages: Number(reviews?.totalPages ?? 0),
    },
    avgRating,
  };
};

const rateMentorship = async (
  mentorshipId: string | number,
  payload: RateMentorshipPayload
): Promise<RateMentorshipApiResponse> => {
  const { data } = await api.post<RateMentorshipApiResponse>(
    `/api/v1/mentorship/${mentorshipId}/rate`,
    payload
  );
  return data;
};

// Query Keys

export const mentorshipReviewsKeys = {
  all: (mentorshipId: string | number) =>
    ['mentorshipReviews', mentorshipId] as const,
  // Specific key — used by useQuery per page
  list: (mentorshipId: string | number, page: number, size: number) =>
    ['mentorshipReviews', mentorshipId, page, size] as const,
};

//  Hooks

export const useMentorshipReviews = (
  mentorshipId: number | string,
  page = 0,
  size = 10,
  enabled = true
) => {
  return useQuery({
    queryKey: mentorshipReviewsKeys.list(mentorshipId, page, size),
    queryFn: ({ signal }) =>
      fetchMentorshipReviews(mentorshipId, page, size, signal),
    enabled: enabled && !!mentorshipId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useRateMentorship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mentorshipId,
      payload,
    }: {
      mentorshipId: string | number;
      payload: RateMentorshipPayload;
    }) => rateMentorship(mentorshipId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: mentorshipReviewsKeys.all(variables.mentorshipId),
      });
    },
  });
};