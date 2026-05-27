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
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 w-full h-full flex flex-col">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-4 gap-2 shrink-0">
        <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
          Reviews on this Mentorship
        </h3>
        
        {/* Pagination Controls */}
        {reviewsTotalPages > 1 && (
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Previous Button */}
            <button
              type="button"
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-white bg-[var(--primary-500)] hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              onClick={() => onPageChange(Math.max(reviewsPage - 1, 0))}
              disabled={reviewsPage <= 0}
              aria-label="Previous reviews page"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Page Counter */}
            <span className="text-xs sm:text-sm font-semibold text-gray-700 tabular-nums px-1">
              {reviewsPage + 1} <span className="text-gray-400 font-normal">/ {reviewsTotalPages}</span>
            </span>

            {/* Next Button */}
            <button
              type="button"
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-white bg-[var(--primary-500)] hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              onClick={() => onPageChange(Math.min(reviewsPage + 1, reviewsTotalPages - 1))}
              disabled={reviewsPage >= reviewsTotalPages - 1}
              aria-label="Next reviews page"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Reviews List Container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 divide-y divide-gray-100 custom-scrollbar">
        {reviews.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 py-4 text-center">No reviews yet</p>
        ) : (
          reviews.map((r, idx) => (
            // Each review takes full width (w-full) and renders stacked below the previous one
            <div key={idx} className="py-4 first:pt-0 last:pb-0 w-full">
              <div className="flex items-start gap-3 w-full">
                {/* Compact Student Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600 shrink-0">
                  {(r.studentName || 'S').charAt(0)}
                </div>

                {/* Review Details - Spans full remaining width */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                      {r.studentName ?? r.name ?? 'Anonymous'}
                    </p>
                    <div className="text-[10px] sm:text-xs text-yellow-500 flex items-center gap-0.5 font-bold shrink-0 bg-yellow-50/60 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      {r.rating ?? 5}
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-1 break-words leading-relaxed w-full text-center">
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