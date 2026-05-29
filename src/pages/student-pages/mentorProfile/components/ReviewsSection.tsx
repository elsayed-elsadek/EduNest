
import { Star, MessageCircleWarning, User, BookOpen } from 'lucide-react';
import { getImageUrl } from '../../../../utils/imageUtils';
import type { MentorProfileReview } from '../../../../services/student-roleService/mentorProfile.api';

interface ReviewsSectionProps {
  reviews: MentorProfileReview[];
  totalReviews?: number;
  avgReviewRate?: number | null;
}

// ✅ Helper: format ISO date string → "May 26, 2026"
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

const ReviewsSection = ({ reviews, totalReviews = 0, avgReviewRate = null }: ReviewsSectionProps) => {
  const displayAverage = avgReviewRate != null
    ? avgReviewRate.toFixed(1)
    : reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : null;

  const displayReviewCount = totalReviews > 0 ? totalReviews : reviews.length;

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Student Reviews</h2>
      </div>

      {displayAverage !== null && (
        <div className="flex items-center gap-2 text-xl font-bold border-b border-slate-100 pb-6 mb-8">
          <Star className="w-6 h-6 fill-[var(--primary-500)] text-[var(--primary-500)]" />
          <span>{displayAverage}</span>
          <span className="text-slate-400 font-medium text-sm">
            based on {displayReviewCount} review{displayReviewCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-10 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center gap-4">
            <MessageCircleWarning className="w-12 h-12 text-slate-300" />
            <p className="text-lg font-medium text-slate-900">No reviews yet</p>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              This mentor has not received any student feedback yet. Students who have engaged with
              this mentor will see their reviews here.
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const reviewerImageUrl = getImageUrl(rev.reviewerImageUrl ?? undefined);
            return (
              <div
                key={rev.id}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition hover:border-[var(--primary-500)]/20 hover:shadow-md"
              >
                {/* Top Row: Reviewer Info + Rating */}
                <div className="flex justify-between mb-5 flex-wrap gap-4">
                  {/* Reviewer Info */}
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      {reviewerImageUrl ? (
                        <img
                          src={reviewerImageUrl}
                          alt={rev.reviewerName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{rev.reviewerName}</h4>
                      {/* ✅ Date */}
                      {rev.createdAt && (
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {formatDate(rev.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => {
                        const isFilled = i < Math.round(rev.rating);
                        return (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              isFilled
                                ? 'fill-[var(--primary-500)] text-[var(--primary-500)]'
                                : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {rev.rating.toFixed(1)} / 5
                    </p>
                  </div>
                </div>

                {/* ✅ Mentorship Badge */}
                {rev.mentorshipTitle && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 bg-[var(--primary-500)]/8 text-[var(--primary-600)] text-xs font-semibold px-3 py-1.5 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{rev.mentorshipTitle}</span>
                    </div>
                  </div>
                )}

                {/* ✅ Review Text — left aligned */}
                <p className="text-slate-600 leading-relaxed font-normal text-left">
                  "{rev.comment}"
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
