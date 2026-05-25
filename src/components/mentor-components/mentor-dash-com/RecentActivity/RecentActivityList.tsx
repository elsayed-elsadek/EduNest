import type { FC } from 'react';
import ActivityItem from './ActivityItem';
import type { RecentActivityListProps } from './RecentActivity.types';
import Pagination from '../Pagination/Pagination';

interface RecentActivityListWithPaginationProps extends RecentActivityListProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const RecentActivityList: FC<RecentActivityListWithPaginationProps> = ({
  activities = [],
  title = 'Recent Students Activity',
  currentPage = 0,
  totalPages = 1,
  onPageChange,
}) => {
  const handleView = (id: string) => {
    console.log('View activity:', id);
    // TODO: Navigate to activity detail
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm">
      {/* Header */}
      <h2 className="text-base font-bold text-[var(--primary-500)] dark:text-[var(--primary-400)] mb-4">
        {title}
      </h2>

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <p className="font-medium">No notifications</p>
          <p className="text-sm mt-1">You don&apos;t have any recent notifications.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-3"
        />
      )}
    </div>
  );
};

export default RecentActivityList;
