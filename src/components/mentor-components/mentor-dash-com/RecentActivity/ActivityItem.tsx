import type { FC } from 'react';
import type { StudentActivity } from './RecentActivity.types';

import { ACTIVITY_CONFIG, detectActivityType, getRelativeTime } from './activityItemUtils';

interface ActivityItemProps {
  activity: StudentActivity;
}

/**
 * =========================================================
 * Component
 * =========================================================
 */

const ActivityItem: FC<ActivityItemProps> = ({ activity }) => {
  const detectedType = detectActivityType(activity);

  const config =
    ACTIVITY_CONFIG[detectedType] ||
    ACTIVITY_CONFIG.default;

  const IconComponent = config.icon;

  const displayTime = activity.timestamp
    ? getRelativeTime(activity.timestamp)
    : '';

  return (
    <div
      className="
        flex items-start gap-3 py-3 px-1
        border-b border-gray-100 dark:border-zinc-800/60
        last:border-b-0
        hover:bg-gray-50/80 dark:hover:bg-zinc-800/30
        transition-all duration-300
        group rounded-xl
      "
    >
      {/* Activity Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`
            w-10 h-10 rounded-full
            ${config.color}
            flex items-center justify-center
            shadow-sm text-white
            group-hover:scale-105
            transition-transform duration-300
          `}
        >
          <IconComponent size={18} strokeWidth={2.5} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {activity.studentName}
          </span>

          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ">
            {activity.action}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
          {activity.mentorshipTitle && (
            <>
              <span className="truncate max-w-[120px] sm:max-w-[220px]">
                {activity.mentorshipTitle}
              </span>

              <span className="text-gray-300 dark:text-zinc-600 text-[10px]">
                •
              </span>
            </>
          )}

          <span
            className="shrink-0 font-medium text-primary"
            title={activity.timestamp?.toString()}
          >
            {displayTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;