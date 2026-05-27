import type { FC } from 'react';
import ReviewCard from './ReviewCard';
import type { ReviewsListProps } from './Reviews.types';
import Pagination from '../Pagination/Pagination';

interface ReviewsListWithPaginationProps extends ReviewsListProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const ReviewsList: FC<ReviewsListWithPaginationProps> = ({
  reviews = [],
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {


  return (
    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm">
      {/* Inline loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-[2px]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary-500)] animate-spin" />
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[var(--primary-500)] dark:text-[var(--primary-400)]">
          Reviews from Students
        </h2>
        {/* <button
          onClick={onViewAll}
          className="text-[11px] text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium"
        >
          View All
        </button> */}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm mt-1">You have not received any student reviews.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              // onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default ReviewsList;
