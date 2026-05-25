import { type FC } from 'react';
import type { StudentActivity } from './RecentActivity.types';

const AVATAR_COLORS: Record<string, string> = {
  submission: 'bg-emerald-500',
  question: 'bg-blue-500',
  completion: 'bg-purple-500',
  default: 'bg-gray-400 dark:bg-zinc-600',
};

// دالة لحساب الوقت النسبي (Relative Time)
const getRelativeTime = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  // إذا مر أكثر من يوم، نعود لتنسيق التاريخ العادي
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface ActivityItemProps {
  activity: StudentActivity;
  onView?: (id: string) => void;
}

const ActivityItem: FC<ActivityItemProps> = ({ activity }) => {
  const colorClass = AVATAR_COLORS[activity.type?.toLowerCase()] || AVATAR_COLORS.default;
  const initial = activity.studentName?.charAt(0).toUpperCase() || '?';
  
  // استخدام دالة الوقت النسبي
  const displayTime = activity.timestamp ? getRelativeTime(activity.timestamp) : '';

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-zinc-800/60 last:border-b-0 hover:bg-gray-50/80 dark:hover:bg-zinc-800/30 transition-all duration-300 group">
      
      <div className="flex-shrink-0 mt-0.5">
        <div className={`w-9 h-9 rounded-full ${colorClass} flex items-center justify-center shadow-sm`}>
          <span className="text-white font-bold text-xs">{initial}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {activity.studentName}
          </span>
          <span className="text-xs font-medium text-red-500 dark:text-red-400">
            {activity.action}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
         {activity.mentorshipTitle && (
            <>
              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                {activity.mentorshipTitle || 'Untitled Mentorship'}
              </span>
              <span className="text-gray-300 dark:text-zinc-600 text-[10px]">•</span>
            </>
          )}
          <span className="shrink-0 font-medium" title={activity.timestamp?.toString()}>
            {displayTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;