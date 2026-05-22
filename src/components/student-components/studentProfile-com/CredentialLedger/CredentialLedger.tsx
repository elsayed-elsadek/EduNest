import { type FC, useMemo, useState } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CredentialLedgerProps } from './CredentialLedger.types';

const CredentialLedger: FC<CredentialLedgerProps> = ({ credentials }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const certificatesPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(credentials.length / certificatesPerPage));

  const paginatedCredentials = useMemo(() => {
    const start = (currentPage - 1) * certificatesPerPage;
    return credentials.slice(start, start + certificatesPerPage);
  }, [currentPage, credentials]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-3">
    <h2 className="text-xl font-bold text-gray-900">Credential Ledger</h2>

    <div className="bg-[#0c2d48] rounded-2xl overflow-hidden">
      {/* Ledger Header */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-yellow-400" />
          <span className="text-[11px] font-bold tracking-widest text-yellow-400 uppercase">
            Academic Ledger V1.0
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white mx-3 mb-3 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Credential Type
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Mentorship
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Rank
          </span>
        </div>

        {/* Rows */}
        {paginatedCredentials.map((cred) => (
          <div key={cred.id} className="grid grid-cols-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0c2d48]" />
              <span className="text-sm font-medium text-gray-800">{cred.type}</span>
            </div>
            <span className="text-sm text-gray-600">{cred.mentorship}</span>
            <span className="inline-flex">
              <span className="px-2.5 py-1 text-[10px] font-bold text-yellow-700 bg-yellow-100 rounded-full uppercase">
                {cred.rank}
              </span>
            </span>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                PREV
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      page === currentPage
                        ? 'bg-[#0c2d48] text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                NEXT
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="px-4 py-3 bg-gray-50">
          <p className="text-[11px] text-gray-400 text-center">
            All credentials are cryptographically signed and verified by the institution.
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default CredentialLedger;