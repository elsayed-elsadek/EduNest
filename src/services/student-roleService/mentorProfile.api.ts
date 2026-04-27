import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { queryClient } from '../../lib/queryClient';
import type { ReactNode } from 'react';

const baseUrl = import.meta.env.VITE_BASE_URL ?? '';

const normalizeImageUrl = (value?: string | null): string | null => {
  if (!value || value.trim() === '') return null;
  if (value.startsWith('http')) return value;
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
};

export interface MentorProfileMentorship {
  id: number;
  difficultyLevel: string;
  price: number;
  discountPercentage: number;
  duration: number;
  coverImageUrl: string | null;
  category: string;
  mentorshipTitle: string;
  mentorshipSubtitle: string;
}

export interface MentorProfileReview {
  reviewerTitle: ReactNode;
  id: number;
  reviewerName: string;
  reviewerEmail?: string;
  reviewerImageUrl: string | null;
  rating: number;
  comment: string;
  mentorshipId: number;
  mentorshipTitle: string;
}

export interface MentorProfile {
  mentorProfileImageUrl: string | null;
  mentorFirstName: string;
  mentorLastName: string;
  totalLearners: number;
  totalReviews: number;
  avgReviewRate: number | null;
  bio: string;
  mentorEmail: string;
}

export interface MentorProfileApiResponse {
  apiResponse: {
    profile: {
      mentorProfile: Record<string, unknown>;
      mentorships: {
        content: Record<string, unknown>[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      };
      reviews: {
        content: Record<string, unknown>[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      };
    };
  };
}

const mapMentorship = (item: Record<string, unknown>): MentorProfileMentorship => ({
  id: Number(item.id ?? 0),
  difficultyLevel: String(item.difficultyLevel ?? 'UNKNOWN'),
  price: Number(item.price ?? 0),
  discountPercentage: Number(item.discountPercentage ?? 0),
  duration: Number(item.duration ?? 0),
  coverImageUrl: normalizeImageUrl(String(item.coverImageUrl ?? '')),
  category: String(item.category ?? 'General'),
  mentorshipTitle: String(item.mentorshipTitle ?? item.title ?? 'Untitled Mentorship'),
  mentorshipSubtitle: String(item.mentorshipSubtitle ?? item.subtitle ?? ''),
});

const mapReview = (item: Record<string, unknown>): MentorProfileReview => ({
  id: Number(item.id ?? 0),
  reviewerName: String(item.userName ?? 'Anonymous'),
  reviewerEmail: String(item.userEmail ?? ''),
  reviewerImageUrl: normalizeImageUrl(String(item.userProfileImageUrl ?? '')),
  rating: Number(item.rating ?? 0),
  comment: String(item.feedBack ?? ''),
  mentorshipId: Number(item.mentorshipId ?? 0),
  mentorshipTitle: String(item.mentorshipTitle ?? ''),
  reviewerTitle: undefined
});

const mapMentorProfile = (payload: Record<string, unknown>) => {
  const mentor = (payload.mentorProfile ?? {}) as Record<string, unknown>;
  return {
    mentorProfileImageUrl: normalizeImageUrl(String(mentor.profileImageUrl ?? '')),
    mentorFirstName: String(mentor.mentorFirstName ?? ''),
    mentorLastName: String(mentor.mentorLastName ?? ''),
    totalLearners: Number(mentor.totalLearners ?? 0),
    totalReviews: Number(mentor.totalReviews ?? 0),
    avgReviewRate: mentor.avgReviewRate == null ? null : Number(mentor.avgReviewRate),
    bio: String(mentor.bio ?? ''),
    mentorEmail: String(mentor.mentorEmail ?? ''),
  };
};

export const fetchMentorProfile = async (
  mentorEmail: string,
  signal?: AbortSignal,
  msSize = 5,
  msPage = 0,
  reviewsSize = 5,
  reviewsPage = 0
) => {
  const { data } = await api.get<MentorProfileApiResponse>(
    `/api/v1/profile/mentor/${encodeURIComponent(mentorEmail)}/full`,
    {
      params: {
        msSize,
        msPage,
        reviewsSize,
        reviewsPage,
      },
      signal,
    }
  );

  const payload = data?.apiResponse?.profile;

  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Mentor profile data is not available.');
  }

  return {
    mentorProfile: mapMentorProfile(payload),
    mentorships: Array.isArray(payload.mentorships?.content)
      ? payload.mentorships.content.map((item) => mapMentorship(item as Record<string, unknown>))
      : [],
    reviews: Array.isArray(payload.reviews?.content)
      ? payload.reviews.content.map((item) => mapReview(item as Record<string, unknown>))
      : [],
  };
};

export const useMentorProfile = (mentorEmail: string, enabled = true) =>
  useQuery({
    queryKey: ['mentorProfile', mentorEmail],
    queryFn: ({ signal }) => fetchMentorProfile(mentorEmail, signal),
    enabled: enabled && mentorEmail.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });

export const prefetchMentorProfile = async (mentorEmail: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['mentorProfile', mentorEmail],
    queryFn: ({ signal }) => fetchMentorProfile(mentorEmail, signal),
    staleTime: 5 * 60 * 1000,
  });
};
