import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LedgerPaginationProps } from '../../../types/admin-role-types/admin-payment.types';

const LedgerPagination: FC<LedgerPaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  perPage,
  onPageChange,
}) => {
  const from  = (currentPage - 1) * perPage + 1;
  const to    = Math.min(currentPage * perPage, totalRecords);

  const buildPages = (): number[] =>
    Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-t border-gray-100">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        Showing {from}–{to} of {totalRecords.toLocaleString()}
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Pages */}
        {buildPages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
              page === currentPage
                ? 'bg-[#0f5e8b] text-white shadow-sm'
                : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LedgerPagination;