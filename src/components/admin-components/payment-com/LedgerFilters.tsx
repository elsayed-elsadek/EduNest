import type { FC } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { LedgerFiltersProps } from '../../../types/admin-role-types/admin-payment.types';

const LedgerFilters: FC<LedgerFiltersProps> = ({ search, onSearch, onOpenFilters }) => (
  <div className="flex items-center gap-3">
    {/* Search */}
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl w-48 sm:w-64">
      <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search ledger..."
        className="text-sm bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 w-full"
      />
    </div>

    {/* Filters Button */}
    <button
      onClick={onOpenFilters}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <SlidersHorizontal className="w-3.5 h-3.5" />
      Filters
    </button>
  </div>
);

export default LedgerFilters;