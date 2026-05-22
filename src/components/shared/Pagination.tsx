import { type FC, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];

    if (currentPage <= 3) {
      // Beginning: 1 2 3 ... last
      pages.push(2, 3);
      if (totalPages > 4) pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Ending: 1 ... last-2 last-1 last
      if (totalPages > 4) pages.push('...');
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Middle: 1 ... current-1 current current+1 ... last
      pages.push('...');
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') onPageChange(page);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-100 transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) => (
          <button
            key={`${page}-${idx}`}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
            className={`w-8 h-8 rounded-full font-semibold text-sm transition-colors ${
              page === '...'
                ? 'text-gray-600 cursor-default'
                : currentPage === page
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-100 transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
