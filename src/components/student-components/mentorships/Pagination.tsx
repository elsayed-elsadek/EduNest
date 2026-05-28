import { type FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Pagination component for navigating through pages
 */
const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages shown around current page
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    const range = [];

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    // Add first page if not already included
    if (left > 1) {
      range.unshift('...');
      range.unshift(1);
    }

    // Add last page if not already included
    if (right < totalPages) {
      range.push('...');
      range.push(totalPages);
    }

    return range;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-gray-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all font-medium ${
                isActive
                  ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]'
                  : 'border-gray-300 text-gray-700 hover:border-[var(--primary-500)] hover:bg-blue-50'
              } disabled:cursor-not-allowed`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Page Info */}
      {/* <span className="ml-4 text-sm text-gray-600 font-medium">
        Page <span className="font-bold">{currentPage}</span> of{' '}
        <span className="font-bold">{totalPages}</span>
      </span> */}
    </div>
  );
};

export default Pagination;
