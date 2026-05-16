import { type FC, useState, useMemo } from 'react';
import ActivityItem from './ActivityItem';
import Pagination from '../../shared/Pagination';
import type { LiveActivityStreamProps } from '../../../types/admin-role-types/admin-dash.types';

const ITEMS_PER_PAGE = 5;

const LiveActivityStream: FC<LiveActivityStreamProps> = ({ events }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

  const paginatedEvents = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return events.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [events, currentPage]);

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Live Activity Stream</h2>
      </div>

      {/* Events */}
      <div className="flex flex-col gap-3">
        {paginatedEvents.map(event => (
          <ActivityItem key={event.id} event={event} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default LiveActivityStream;