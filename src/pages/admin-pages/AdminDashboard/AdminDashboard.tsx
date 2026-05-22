
import { type FC, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DashboardHeader    from '../../../components/admin-components/admin-dash-com/DashboardHeader';
import StatsGrid          from '../../../components/admin-components/admin-dash-com/StatsGrid';
import EngagementChart, { CHART_RANGES } from '../../../components/admin-components/admin-dash-com/EngagementChart';
import TopMentors         from '../../../components/admin-components/admin-dash-com/TopMentors';
import LiveActivityStream from '../../../components/admin-components/admin-dash-com/LiveActivityStream';
import { exportDashboardSummary } from '../../../utils/exportDashboardSummary';
import {
  useAdminDashboard,
  ADMIN_DASHBOARD_KEY,
} from '../../../services/admin-role-service/Admindashboardservice';

const Skeleton: FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const DashboardSkeleton: FC = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
      <Skeleton className="h-72" />
      <Skeleton className="h-72" />
    </div>
    <Skeleton className="h-60" />
  </div>
);

const MonitoringDashboard: FC = () => {
  const queryClient = useQueryClient();

  // default: 'All' → months=0 → API بيرجع كل الـ data
  const [selectedRange, setSelectedRange] = useState<string>(CHART_RANGES[0].label);

  // بيحول الـ label لـ months number عشان يتبعت للـ API
  const months = CHART_RANGES.find(r => r.label === selectedRange)?.months ?? 0;

  const { data, isLoading, isError, isFetching, refetch } = useAdminDashboard(months);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_KEY });
    refetch();
  }, [queryClient, refetch]);

  const handleExport = useCallback(() => {
    if (!data) return;
    exportDashboardSummary(data);
  }, [data]);

  const handleRangeChange = useCallback((range: string) => {
    setSelectedRange(range);
  }, []);

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F6FA]">
        <div className="text-center space-y-3">
          <p className="text-red-500 font-semibold">Failed to load dashboard data.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#0f5e8b] rounded-xl hover:bg-[#0a4a6e] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F5F6FA]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <DashboardHeader
          onExport={handleExport}
          onRefresh={handleRefresh}
          isLoading={isFetching}
        />

        {isLoading ? (
          <DashboardSkeleton />
        ) : data ? (
          <>
            <StatsGrid stats={data.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mb-0">
              <EngagementChart
                data={data.chartData}
                selectedRange={selectedRange}
                onRangeChange={handleRangeChange}
              />
              <TopMentors
                mentors={data.mentors}
              />
            </div>

            <LiveActivityStream
              events={data.events}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MonitoringDashboard;