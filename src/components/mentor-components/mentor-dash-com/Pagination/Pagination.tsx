import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  /** Current page — 0-based to match backend */
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Returns an array of page indices (0-based) or "..." strings */
function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const range: (number | '...')[] = [];

  // Always show first page
  range.push(0);

  if (current > 3) range.push('...');

  const start = Math.max(1, current - 1);
  const end   = Math.min(total - 2, current + 1);

  for (let i = start; i <= end; i++) range.push(i);

  if (current < total - 4) range.push('...');

  // Always show last page
  range.push(total - 1);

  return range;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pages  = buildPageRange(currentPage, totalPages);
  const isFirst = currentPage === 0;
  const isLast  = currentPage >= totalPages - 1;

  return (
    <div className={`flex items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2 ${className}`}>

      {/* ── Previous ─────────────────────────────────────────────── */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Previous page"
        className="
          flex items-center gap-1 px-3 h-9 rounded-xl text-sm font-medium
          bg-white dark:bg-zinc-800/50 text-gray-700 dark:text-gray-300
          border border-gray-200 dark:border-zinc-700/50
          hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white
          active:scale-95 disabled:opacity-40 disabled:pointer-events-none
          transition-all duration-200 select-none shadow-sm
        "
      >
        <ChevronLeft className="w-4 h-4" />
        {/* <span className="hidden sm:block"></span> */}
      </button>

      {/* ── Page Numbers ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-zinc-500 text-sm tracking-widest select-none"
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page + 1}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`
                flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium
                transition-all duration-200 select-none
                ${
                  page === currentPage
                    ? 'bg-[var(--primary-500)] text-white shadow-md shadow-[var(--primary-500)]/25 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white border border-transparent'
                }
              `}
            >
              {page + 1}
            </button>
          ),
        )}
      </div>

      {/* ── Next ─────────────────────────────────────────────────── */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Next page"
        className="
          flex items-center gap-1 px-3 h-9 rounded-xl text-sm font-medium
          bg-white dark:bg-zinc-800/50 text-gray-700 dark:text-gray-300
          border border-gray-200 dark:border-zinc-700/50
          hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white
          active:scale-95 disabled:opacity-40 disabled:pointer-events-none
          transition-all duration-200 select-none shadow-sm
        "
      >
        {/* <span className="hidden sm:block"></span> */}
        <ChevronRight className="w-4 h-4" />
      </button>
      
    </div>
  );
};

export default Pagination;