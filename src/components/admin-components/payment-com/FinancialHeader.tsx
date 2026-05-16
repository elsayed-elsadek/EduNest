import type { FC } from 'react';
import { Calendar } from 'lucide-react';
import type { FinancialHeaderProps } from '../../../types/admin-role-types/admin-payment.types';

const FinancialHeader: FC<FinancialHeaderProps> = ({ dateRange }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Financial Oversight
      </h1>
      <p className="text-sm text-gray-500 mt-1.5 max-w-md leading-relaxed">
        Orchestrate and monitor the platform's financial health with real-time
        settlement tracking.
      </p>
    </div>

    <div className="flex-shrink-0">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
        <Calendar className="w-4 h-4 text-gray-400" />
        {dateRange}
      </div>
    </div>
  </div>
);

export default FinancialHeader;