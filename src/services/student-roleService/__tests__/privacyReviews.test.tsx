import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock('../../api', () => ({ default: { get: getMock } }));

import { fetchMentorshipReviews } from '../mentorshipReviews.api';
import { fetchMentorProfile } from '../mentorProfile.api';
import ReviewsSection from '../../../pages/student-pages/mentorProfile/components/ReviewsSection';
import { ReviewItem } from '../../../pages/student-pages/mentorshipDetails/reviews/ReviewItem';

beforeEach(() => getMock.mockReset());
afterEach(() => cleanup());

describe('privacy-safe mentorship reviews', () => {
  it('maps retained fields, average rating and pagination without copying removed PII', async () => {
    getMock.mockResolvedValue({
      data: { apiResponse: {
        reviews: {
          content: [{
            reviewId: 17,
            studentFullName: 'Morgan Student',
            rating: 5,
            feedback: 'Clear and useful.',
            studentEmail: 'must-not-be-mapped@example.test',
            studentProfileImageUrl: '/private.jpg',
          }],
          page: 1,
          size: 6,
          totalElements: 12,
          totalPages: 2,
        },
        avgRating: 4.75,
      } },
    });

    const result = await fetchMentorshipReviews('mentorship-id', 1, 6);

    expect(result).toEqual({
      reviewsPage: {
        content: [{ reviewId: 17, studentFullName: 'Morgan Student', rating: 5, feedback: 'Clear and useful.' }],
        page: 1,
        size: 6,
        totalElements: 12,
        totalPages: 2,
      },
      avgRating: 4.75,
    });
    expect(getMock).toHaveBeenCalledWith('/api/v1/student/mentorships/mentorship-id/reviews', {
      params: { page: 1, size: 6 },
      signal: undefined,
    });

    const review = result.reviewsPage.content[0];
    render(<ReviewItem review={review} />);
    expect(screen.getByText('Morgan Student')).toBeTruthy();
    expect(screen.getByText(/Clear and useful\./)).toBeTruthy();
    expect(screen.queryByText(/@example\.test/)).toBeNull();
  });
});

describe('privacy-safe mentor profile reviews', () => {
  it('maps /full nested reviews without removed PII and keeps the existing endpoint and pagination params', async () => {
    getMock.mockResolvedValue({
      data: { apiResponse: { profile: {
        mentorProfile: {},
        mentorships: { content: [], page: 0, size: 5, totalElements: 0, totalPages: 0 },
        reviews: {
          content: [{
            id: 9,
            userName: 'Taylor Reviewer',
            rating: 4,
            feedBack: 'Thoughtful mentorship.',
            mentorshipId: 21,
            mentorshipTitle: 'Design Basics',
            createdAt: '2025-03-01T00:00:00Z',
            userEmail: 'private@example.test',
            userProfileImageUrl: '/private.jpg',
          }],
          page: 1,
          size: 5,
          totalElements: 8,
          totalPages: 2,
        },
      } } },
    });

    const result = await fetchMentorProfile('mentor@example.test', undefined, 5, 0, 5, 1);

    expect(getMock).toHaveBeenCalledWith('/api/v1/profile/mentor/mentor%40example.test/full', {
      params: { msSize: 5, msPage: 0, reviewsSize: 5, reviewsPage: 1 },
      signal: undefined,
    });
    expect(result.reviews).toEqual([{
      id: 9,
      userName: 'Taylor Reviewer',
      rating: 4,
      feedBack: 'Thoughtful mentorship.',
      mentorshipId: 21,
      mentorshipTitle: 'Design Basics',
      createdAt: '2025-03-01T00:00:00Z',
    }]);
    expect(result.reviewsPage).toEqual({ page: 1, size: 5, totalElements: 8, totalPages: 2 });
  });

  it('keeps the avatar fallback, rating, and review pagination in the profile view', () => {
    const onPageChange = vi.fn();
    render(<ReviewsSection
      reviews={[{
        id: 9,
        userName: 'Taylor Reviewer',
        rating: 4,
        feedBack: 'Thoughtful mentorship.',
        mentorshipId: 21,
        mentorshipTitle: 'Design Basics',
        createdAt: '2025-03-01T00:00:00Z',
      }]}
      totalReviews={8}
      avgReviewRate={4.5}
      currentPage={1}
      totalPages={2}
      onPageChange={onPageChange}
    />);

    expect(screen.getByText('Taylor Reviewer')).toBeTruthy();
    expect(screen.getByText(/Thoughtful mentorship\./)).toBeTruthy();
    expect(screen.getByText('Design Basics')).toBeTruthy();
    expect(screen.getByText('4.5')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
