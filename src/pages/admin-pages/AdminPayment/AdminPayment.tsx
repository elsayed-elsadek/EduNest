
import { type FC, useState, useMemo, useEffect } from 'react';
import FinancialHeader  from '../../../components/admin-components/payment-com/FinancialHeader';
import SalesChart       from '../../../components/admin-components/payment-com/SalesChart';
import HistoricalLedger from '../../../components/admin-components/payment-com/HistoricalLedger';
import { useFinancialOversight } from '../../../hooks/admin-roleHooks/UsePayment';

const PER_PAGE = 3;

const FinancialOversight: FC = () => {
  const [apiPage,  setApiPage ] = useState(0);
  const [search,   setSearch  ] = useState('');

  const { records, totalElements, totalPages, chartData, loading } =
    useFinancialOversight(apiPage, PER_PAGE);

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(r =>
      r.userName.toLowerCase().includes(q)        ||
      r.email.toLowerCase().includes(q)           ||
      r.mentorName.toLowerCase().includes(q)      ||
      r.mentorshipTitle.toLowerCase().includes(q)
    );
  }, [records, search]);

  const currentPage  = apiPage + 1;
  const handlePageChange = (uiPage: number) => setApiPage(uiPage - 1);

  const displayedRecords = useMemo(() => {
    if (!search.trim()) return records;
    const start = (currentPage - 1) * PER_PAGE;
    return filteredRecords.slice(start, start + PER_PAGE);
  }, [filteredRecords, currentPage, search, records]);

  useEffect(() => {
    const effectiveTotalPages = search.trim() ? Math.ceil(filteredRecords.length / PER_PAGE) : totalPages;
    if (currentPage > effectiveTotalPages && effectiveTotalPages > 0) {
      setApiPage(0);
    }
  }, [currentPage, filteredRecords.length, totalPages, search]);

  const handleSearch = (v: string) => {
    setSearch(v);
    setApiPage(0);
  };

  const dateRangeLabel = chartData.length
    ? chartData.map(c => c.date).join(' — ')
    : '—';

  return (
    <div className="h-full overflow-y-auto bg-[#F5F6FA]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        <FinancialHeader dateRange={dateRangeLabel} />

        {/* Sales Chart */}
        <SalesChart data={chartData} />

        {/* Historical Ledger */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-sm text-gray-400">
            Loading records…
          </div>
        ) : (
          <HistoricalLedger
            records={displayedRecords}
            totalRecords={search.trim() ? filteredRecords.length : totalElements}
            currentPage={currentPage}
            totalPages={search.trim() ? Math.ceil(filteredRecords.length / PER_PAGE) : totalPages}
            perPage={PER_PAGE}
            search={search}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default FinancialOversight;