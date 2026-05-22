
import  type { FC } from 'react';
import { Calendar, Users, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TimelineEvent } from '../../../../types/student-role-types/course.types';

interface TimelineItemProps {
  event: TimelineEvent;
}

const TimelineItem: FC<TimelineItemProps> = ({ event }) => {
  const iconBgColors: Record<string, string> = {
    MENTORSHIP: 'bg-blue-100',
    ASSIGNMENT: 'bg-orange-100',
    PROJECT: 'bg-purple-100',
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'MENTORSHIP':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'ASSIGNMENT':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'PROJECT':
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Link to={`/student/learning/${event.id}`} className="block">
      <div className="flex gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors group">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full ${iconBgColors[event.type] ?? 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
          {getIcon(event.type)}
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
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Join Meeting
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TimelineItem;