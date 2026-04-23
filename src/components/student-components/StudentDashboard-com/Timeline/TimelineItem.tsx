

import  type { FC } from 'react';
import type { TimelineEvent } from '../../../../types/student-role-types/course.types';


interface TimelineItemProps {
  event: TimelineEvent;
}

const TimelineItem: FC<TimelineItemProps> = ({ event }) => {
  const iconBgColors = {
    MENTORSHIP: 'bg-blue-100',
    ASSIGNMENT: 'bg-orange-100',
    PROJECT: 'bg-purple-100',
  };

  return (
    <div className="flex gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors group">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full ${iconBgColors[event.type]} flex items-center justify-center flex-shrink-0`}>
        <span className="text-xl">{event.icon || '📅'}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
            {event.title}
          </h4>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {event.date}
          </span>
        </div>
        
        {event.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {event.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{event.time}</span>
          {event.status === 'UPCOMING' && (
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Join Meeting →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;