
import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 px-2 py-1">

      <div className="flex items-center gap-2 text-[11px] md:text-xs text-gray-400 font-medium order-2 sm:order-1">
        <span>Showing</span>
        <div className="relative group">
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-1.5 text-gray-900 dark:text-gray-100 font-bold outline-none cursor-pointer focus:border-blue-500 dark:focus:border-blue-400 transition-all"
          >
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={20}>20</option>
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600" />
        </div>
        <span className="whitespace-nowrap">items in one page</span>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 md:px-4 py-2 text-[11px] md:text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--primary-500)] dark:hover:text-gray-100 disabled:opacity-30 transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {renderPageNumbers().map((page, i) => (
            <button
              key={i}
              disabled={page === '...'}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-[11px] md:text-xs font-bold transition-all ${page === currentPage
                ? 'bg-[var(--primary-500)] text-white scale-105 hover:bg-[var(--primary-500)] hover:text-white'
                : page === '...'
                  ? 'text-gray-400 cursor-default '
                  : 'text-gray-500 hover:bg-[var(--primary-500)] hover:text-white'
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 md:px-4 py-2 text-[11px] md:text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--primary-500)] dark:hover:text-gray-100 disabled:opacity-30 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;


