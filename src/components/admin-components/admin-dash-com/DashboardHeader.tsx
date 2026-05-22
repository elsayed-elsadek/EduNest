
import type { FC } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import type { DashboardHeaderProps } from '../../../types/admin-role-types/admin-dash.types';

const DashboardHeader: FC<DashboardHeaderProps> = ({ onExport, onRefresh, isLoading }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Monitoring Dashboard
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Real-time oversight of Edunest's mentorship ecosystem.
      </p>
    </div>

    <div className="flex items-center gap-3 flex-shrink-0">
      <button
        onClick={onExport}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        Export Summary
      </button>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0f5e8b] rounded-xl hover:bg-[#0a4a6e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Refreshing...' : 'Refresh Data'}
      </button>
    </div>
  </div>
);

export default DashboardHeader;