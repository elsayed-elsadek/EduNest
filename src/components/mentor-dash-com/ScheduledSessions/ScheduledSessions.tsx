import type { FC } from 'react';
import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import ScheduledSessionCard from './ScheduledSessionCard';
import type { ScheduledSessionsProps } from './ScheduledSessions.types';

const MAX_VISIBLE_SESSIONS = 3;

const ScheduledSessions: FC<ScheduledSessionsProps> = ({ sessions = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // التأكد إن فيه داتا فعلاً
  const hasSessions = sessions && sessions.length > 0;
  const showExpandButton = sessions.length > MAX_VISIBLE_SESSIONS;

  // تحديد الجلسات اللي هتظهر بناءً على حالة الـ Toggle
  const visibleSessions = isExpanded 
    ? sessions 
    : sessions.slice(0, MAX_VISIBLE_SESSIONS);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-gray-900">
          Scheduled sessions
        </h2>
        <Calendar className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-3">
        {hasSessions ? (
          <>
            {/* عرض الجلسات المفلترة */}
            {visibleSessions.map((session) => (
              <ScheduledSessionCard key={session.id} session={session} />
            ))}
            
            {/* زرار العرض (Show More / Show Less) */}
            {showExpandButton && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-1 py-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Show {sessions.length - MAX_VISIBLE_SESSIONS} more</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          /* حالة عدم وجود بيانات */
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No upcoming sessions</p>
            <p className="text-xs text-gray-400 mt-1">Schedule a session to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledSessions;