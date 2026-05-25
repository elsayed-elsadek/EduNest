import type { FC } from 'react';
import { Calendar } from 'lucide-react';
import ScheduledSessionCard from './ScheduledSessionCard';
import type { ScheduledSessionsProps } from './ScheduledSessions.types';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';

interface ScheduledSessionsWithPaginationProps extends ScheduledSessionsProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const ScheduledSessions: FC<ScheduledSessionsWithPaginationProps> = ({
  sessions = [],
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}) => {
  const hasSessions = sessions.length > 0;

  return (
    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm">
      {/* Inline loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-[2px]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary-500)] animate-spin" />
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          Scheduled Sessions
        </h2>
        <Calendar className="w-4 h-4 text-gray-400" />
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {hasSessions ? (
          <>
            {sessions.map((session) => (
              <Link
                to={`/mentor/mentorships/${session.mentorshipId ?? 'unknown'}/sessions`}
                key={session.id}
                className="block rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <ScheduledSessionCard session={session} />
              </Link>
            ))}
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">No upcoming sessions</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Schedule a session to get started
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasSessions && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default ScheduledSessions;