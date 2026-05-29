import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MessageSquare, PenLine } from 'lucide-react';
import { useMentorshipReviews } from '../../../services/student-roleService/mentorshipReviews.api';
import Pagination from '../../../components/student-components/mentorships/Pagination';

import { StarRating } from './reviews/StarRating';
import { ReviewItem } from './reviews/ReviewItem';
import { WriteReviewModal } from './reviews/WriteReviewModal';

interface MentorshipDetailsOutletContext {
  mentorshipId: number;
  isLoading: boolean;
}

const PAGE_SIZE = 6;

const ReviewsSection = () => {
  const { mentorshipId, isLoading: mentorshipLoading } =
    useOutletContext<MentorshipDetailsOutletContext>();

  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isError, error } = useMentorshipReviews(
    mentorshipId,
    page,
    PAGE_SIZE,
    !mentorshipLoading
  );

  const reviewsPage = data?.reviewsPage ?? { content: [], totalElements: 0, totalPages: 0 };
  const avgRating = data?.avgRating ?? 0;

  const hasReviews = reviewsPage.content.length > 0;
  const showLoading = mentorshipLoading || isLoading;

  return (
    <div className="space-y-8">
      {showModal && (
        <WriteReviewModal mentorshipId={mentorshipId} onClose={() => setShowModal(false)} />
      )}

      <section className="grid gap-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm lg:grid-cols-[320px_1fr]">
        <div className="rounded-[2rem] bg-slate-50 dark:bg-slate-950 p-6">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-[var(--primary-500)]/10 px-4 py-3 text-[var(--primary-500)]">
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.3em]">Student feedback</span>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Average rating
            </p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-semibold text-slate-900 dark:text-slate-100">{avgRating.toFixed(1)}</span>
              <span className="mb-1 text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">/ 5</span>
            </div>

            <div className="mt-4">
              <StarRating rating={avgRating} />
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {reviewsPage.totalElements} review
              {reviewsPage.totalElements === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Why students love it
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                A clean review experience with insights that matter
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-slate-50 dark:bg-slate-950 p-5">
                <p className="text-sm font-semibold text-[var(--primary-500)]">Fast feedback</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Recent students can leave a review quickly and share their mentorship experience.
                </p>
              </div>

              <div className="rounded-[1.75rem] bg-slate-50 dark:bg-slate-950 p-5">
                <p className="text-sm font-semibold text-[var(--primary-500)]">Helpful guidance</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Enjoy a modern review layout built to highlight student quotes and ratings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Mentorship reviews</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">What students are saying</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-[var(--primary-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[var(--primary-500)]/10">
              Latest feedback
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-3xl border-2 border-[var(--primary-500)] px-5 py-3 text-sm font-semibold text-[var(--primary-500)] transition hover:bg-[var(--primary-500)] hover:text-white"
            >
              <PenLine className="h-4 w-4" />
              Write a Review
            </button>
          </div>
        </div>

        {isError && (
          <div className="mt-6 rounded-3xl bg-red-50 dark:bg-red-950/50 p-6 text-red-700 dark:text-red-400">
            {error instanceof Error ? error.message : 'Unable to load mentorship reviews.'}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {showLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))
          ) : !hasReviews ? (
            <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-12 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">No reviews yet</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Be the first to share your experience!</p>
            </div>
          ) : (
            reviewsPage.content.map((review) => <ReviewItem key={review.reviewId} review={review} />)
          )}
        </div>

        {hasReviews && reviewsPage.totalPages > 1 && (
          <div className="mt-8 flex flex-col gap-4 items-center justify-center rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 sm:flex-row">
            <Pagination
              currentPage={page + 1}
              totalPages={reviewsPage.totalPages}
              onPageChange={(nextPage1Based: number) => setPage(nextPage1Based - 1)}
              isLoading={showLoading}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default ReviewsSection;
