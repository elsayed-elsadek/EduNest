

import type { FC } from 'react';
import { Eye } from 'lucide-react';
import type { StudentActivity } from './RecentActivity.types';

interface ActivityItemProps {
  activity: StudentActivity;
  onView?: (id: string) => void;
}

const ActivityItem: FC<ActivityItemProps> = ({ activity, onView }) => {
  const avatarColors = {
    submission: 'bg-green-500',
    question: 'bg-blue-500',
    completion: 'bg-purple-500',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors group">
      {/* Avatar with Initial Letter */}
      <div className="flex-shrink-0">
        <div className={`w-9 h-9 rounded-full ${avatarColors[activity.type]} flex items-center justify-center`}>
          <span className="text-white font-bold text-xs">
            {activity.studentName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Student Name & Action */}
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-[13px] font-semibold text-gray-900">
            {activity.studentName}
          </span>
          <span className="text-[13px] font-semibold text-red-600">
            {activity.action}
          </span>
        </div>

        {/* Mentorship Title & Time */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[11px] text-gray-500">
            mentorship-{activity.mentorshipTitle}
          </span>
          <span className="text-gray-300 text-[10px]">•</span>
          <span className="text-[11px] text-gray-400">
            {activity.timestamp}
          </span>
        </div>
      </div>

      {/* View Button */}
      {onView && (
        <button
        
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded hover:bg-gray-200 transition-all flex-shrink-0"
        >
          <Eye className="w-3.5 h-3.5 text-gray-500" />
        </button>

      )}
    </div>
  );
};

export default ActivityItem;


