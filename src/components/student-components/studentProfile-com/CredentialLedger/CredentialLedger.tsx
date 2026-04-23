import type { FC } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { CredentialLedgerProps } from './CredentialLedger.types';

const CredentialLedger: FC<CredentialLedgerProps> = ({ credentials }) => (
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
        {credentials.map((cred) => (
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

export default CredentialLedger;