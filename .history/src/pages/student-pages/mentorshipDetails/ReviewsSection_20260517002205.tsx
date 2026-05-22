import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageSquare, Star, User } from 'lucide-react';
import { useMentorshipReviews } from '../../../services/student-roleService/mentorshipReviews.api';
import { API_BASE_URL } from '../../../services/api';

// Types for Context and Data
interface MentorshipDetailsOutletContext {
  mentorshipId: number;
  isLoading: boolean;
}

const PAGE_SIZE = 6;

// --- Sub-components ---

/**
 * Reusable Star Rating component for consistent display logic
 */
const StarRating = ({ rating, size = 5 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-1 text-[var(--primary-500)]">
    {Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-${size} h-${size} ${
          index < Math.round(rating)
            ? 'fill-[var(--primary-500)] text-[var(--primary-500)]'
            : 'text-slate-300'
        }`}
      />
    ))}
  </div>
);

/**
 * Renders individual review cards
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReviewItem = ({ review }: { review: any }) => (
  <article className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 transition hover:shadow-lg hover:border-[var(--primary-500)]/20">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-200">
          {review.studentProfileImageUrl ? (
            <img
<<<<<<< HEAD
              src={review.studentProfileImageUrl}
=======
              src={API_BASE_URL+review.studentProfileImageUrl}
>>>>>>> Student-role
              alt={review.studentFullName}
              className="h-full w-full object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <User className="h-6 w-6" />
            </div>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">{review.studentFullName}</p>
          <p className="text-sm text-slate-500">{review.studentEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StarRating rating={review.rating} size={4} />
        <span className="text-sm font-semibold text-slate-900">{review.rating}/5</span>
      </div>
    </div>
    <p className="mt-4 text-slate-700 leading-relaxed">{review.feedback}</p>
  </article>
);

// --- Main Section ---

const ReviewsSection = () => {
  const { mentorshipId, isLoading: mentorshipLoading } = useOutletContext<MentorshipDetailsOutletContext>();
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error } = useMentorshipReviews(
    mentorshipId,
    page,
    PAGE_SIZE,
    !mentorshipLoading
  );

  // Default object structure to prevent undefined access issues
  const reviewsPage = data?.reviewsPage ?? { content: [], totalElements: 0, totalPages: 0 };
  const avgRating = data?.avgRating ?? 0;
  
  const hasReviews = reviewsPage.content.length > 0;
  const showLoading = mentorshipLoading || isLoading;

  const pageNumbers = useMemo(() => {
    return Array.from({ length: Math.max(1, reviewsPage.totalPages) }, (_, index) => index);
  }, [reviewsPage.totalPages]);

  return (
    <div className="space-y-8">
      {/* Overview Stats Section */}
      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[320px_1fr]">
        <div className="rounded-[2rem] bg-slate-50 p-6">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-[var(--primary-500)]/10 px-4 py-3 text-[var(--primary-500)]">
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.3em]">Student feedback</span>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Average rating</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-semibold text-slate-900">{avgRating.toFixed(1)}</span>
              <span className="mb-1 text-sm uppercase tracking-[0.24em] text-slate-500">/ 5</span>
            </div>
            <div className="mt-4">
               <StarRating rating={avgRating} />
            </div>
            <p className="mt-4 text-sm text-slate-500">{reviewsPage.totalElements} review{reviewsPage.totalElements === 1 ? '' : 's'}</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Why students love it</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">A clean review experience with insights that matter</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-[var(--primary-500)]">Fast feedback</p>
                <p className="mt-2 text-sm text-slate-600">Recent students can leave a review quickly and share their mentorship experience.</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-[var(--primary-500)]">Helpful guidance</p>
                <p className="mt-2 text-sm text-slate-600">Enjoy a modern review layout built to highlight student quotes and ratings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List Section */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Mentorship reviews</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">What students are saying</h2>
          </div>
          <div className="rounded-3xl bg-[var(--primary-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[var(--primary-500)]/10">
            Latest feedback
          </div>
        </div>

        {/* Error Handling */}
        {isError && (
          <div className="mt-6 rounded-3xl bg-red-50 p-6 text-red-700">
            {error instanceof Error ? error.message : 'Unable to load mentorship reviews.'}
          </div>
        )}

        {/* Loading/Data States */}
        <div className="mt-6 space-y-5">
          {showLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-[2rem] bg-slate-100 animate-pulse" />)
          ) : !hasReviews ? (
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-lg font-semibold text-slate-900">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsPage.content.map((review) => <ReviewItem key={review.reviewId} review={review} />)}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {hasReviews && reviewsPage.totalPages > 1 && (
          <div className="mt-8 flex flex-col gap-4 items-center justify-between rounded-[2rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row">
            <p className="text-sm text-slate-600">
              Showing {page * PAGE_SIZE + 1} to {page * PAGE_SIZE + reviewsPage.content.length} of {reviewsPage.totalElements} reviews
            </p>
            <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-sm">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(p - 1, 0))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {pageNumbers.map((pNum) => (
                <button
                  key={pNum}
                  className={`h-10 min-w-[2.5rem] rounded-full px-3 text-sm font-semibold transition ${
                    pNum === page ? 'bg-[var(--primary-500)] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => setPage(pNum)}
                >
                  {pNum + 1}
                </button>
              ))}

              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(p + 1, reviewsPage.totalPages - 1))}
                disabled={page >= reviewsPage.totalPages - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReviewsSection;