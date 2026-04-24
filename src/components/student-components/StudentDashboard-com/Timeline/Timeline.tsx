
import type { FC } from 'react';
import { Calendar } from 'lucide-react';
import { theme } from '../../../../theme/colors';
import TimelineItem from './TimelineItem';
import type { TimelineEvent } from '../../../../types/student-role-types/course.types';

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: FC<TimelineProps> = ({ events }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Calendar className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Today's Date */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-600">Today's schedule</p>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>

      {/* View Details Link */}
      <button className="w-full mt-4 py-2.5 text-sm font-medium border rounded-lg hover:opacity-80 transition-colors"
        style={{ 
          color: theme.primary[600],
          borderColor: theme.primary[200],
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.primary[50];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        See full schedule
      </button>
    </div>
  );
};

export default Timeline;