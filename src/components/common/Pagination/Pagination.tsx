
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
            className="appearance-none bg-[#F9FAFB] border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-[#1A1C1E] font-bold outline-none cursor-pointer focus:border-[#2176AE] transition-all"
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

      <div className="flex items-center gap-1 bg-[#F1F2F4] p-1 rounded-xl order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 md:px-4 py-2 text-[11px] md:text-xs font-bold text-gray-500 hover:text-[#1A1C1E] disabled:opacity-30 transition-colors"
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
                ? 'bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.05)] text-[#1A1C1E] scale-105'
                : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-500 hover:bg-white/50 hover:text-[#1A1C1E]'
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 md:px-4 py-2 text-[11px] md:text-xs font-bold text-gray-500 hover:text-[#1A1C1E] disabled:opacity-30 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;