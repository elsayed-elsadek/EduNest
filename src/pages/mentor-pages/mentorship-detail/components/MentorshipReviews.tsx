import type { FC } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Review } from '../types';

interface MentorshipReviewsProps {
  reviews: Review[];
  reviewsPage: number;
  reviewsTotalPages: number;
  onPageChange: (page: number) => void;
  reviewsSize: number;
}

const MentorshipReviews: FC<MentorshipReviewsProps> = ({
  reviews,
  reviewsPage,
  reviewsTotalPages,
  onPageChange,
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Reviews on this Mentorship</h3>
        
        {reviewsTotalPages > 1 && (
          <div className="flex items-center gap-2">
            {/* زر السابق */}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white bg-[var(--primary-500)] hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              onClick={() => onPageChange(Math.max(reviewsPage - 1, 0))}
              disabled={reviewsPage <= 0}
              aria-label="Previous reviews page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* عداد الصفحات */}
            <span className="text-sm font-semibold text-gray-700 tabular-nums px-1">
              {reviewsPage + 1} <span className="text-gray-400 font-normal">/ {reviewsTotalPages}</span>
            </span>

            {/* زر التالي */}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white bg-[var(--primary-500)] hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              onClick={() => onPageChange(Math.min(reviewsPage + 1, reviewsTotalPages - 1))}
              disabled={reviewsPage >= reviewsTotalPages - 1}
              aria-label="Next reviews page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100 max-h-44 md:max-h-56 overflow-y-auto pr-2">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="py-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {(r.studentName || 'S').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {r.studentName ?? r.name ?? 'Anonymous'}
                    </p>
                    <div className="text-xs text-yellow-500 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {r.rating ?? 5}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    "{r.feedBack ?? r.message ?? ''}"
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MentorshipReviews;