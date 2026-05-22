import type { FC } from 'react';
import LedgerFilters    from './LedgerFilters';
import LedgerRow        from './LedgerRow';
import LedgerPagination from './LedgerPagination';
import type { HistoricalLedgerProps } from '../../../types/admin-role-types/admin-payment.types';

const COL_HEADERS = [
  'Student',
  'Email',
  'Mentor Name',
  'Mentorship Title',
  'Date',
  'Platform Profit',
  'Amount',
] as const;

const HistoricalLedger: FC<HistoricalLedgerProps> = ({
  records,
  totalRecords,
  currentPage,
  totalPages,
  perPage,
  search,
  onSearch,
  onPageChange,
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

    {/* Section Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">Historical Ledger</h2>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {totalRecords.toLocaleString()} records
        </span>
      </div>

      <LedgerFilters
        search={search}
        onSearch={onSearch}
        onOpenFilters={() => console.log('Open filters')}
      />
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            {COL_HEADERS.map(col => (
              <th
                key={col}
                className={`py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left ${
                  col === 'Student' ? 'pl-4 pr-3' : col === 'Amount' ? 'pl-3 pr-4' : 'px-3'
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {records.length > 0 ? (
            records.map(record => (
              <LedgerRow key={record.id} record={record} />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="py-16 text-center text-sm text-gray-400">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <LedgerPagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalRecords={totalRecords}
      perPage={perPage}
      onPageChange={onPageChange}
    />
  </div>
);

export default HistoricalLedger;