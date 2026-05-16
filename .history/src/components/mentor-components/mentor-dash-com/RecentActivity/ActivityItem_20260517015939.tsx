import { type FC, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { StudentActivity } from './RecentActivity.types';

interface ActivityItemProps {
  activity: StudentActivity;
  onView?: (id: string) => void;
}

const ActivityItem: FC<ActivityItemProps> = ({ activity, onView }) => {
  const [blurred, setBlurred] = useState(false);

  const avatarColors = {
    submission: 'bg-green-500',
    question: 'bg-blue-500',
    completion: 'bg-purple-500',
  };

  const toggleBlur = () => setBlurred((p) => !p);

  const privacyClass = blurred
    ? 'opacity-40 blur-[1.2px] select-none'
    : 'opacity-100 blur-0';

  const maskStyle = blurred
    ? {
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
      }
    : {};

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40 transition group">

      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-9 h-9 rounded-full ${avatarColors[activity.type]} flex items-center justify-center`}>
          <span className="text-white font-bold text-xs">
            {activity.studentName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" style={maskStyle}>

        {/* Name + Action */}
        <div
          className={`
            flex items-baseline gap-1 flex-wrap
            transition-all duration-300 ease-out
            ${privacyClass}
          `}
        >
          <span className="text-[13px] font-semibold text-gray-900">
            {activity.studentName}
          </span>
          <span className="text-[13px] font-semibold text-red-600">
            {activity.action}
          </span>
        </div>

        {/* Details */}
        <div
          className={`
            flex items-center gap-1.5 mt-1
            transition-all duration-300 ease-out
            ${privacyClass}
          `}
        >
          <span className="text-[11px] text-gray-500">
            mentorship-{activity.mentorshipTitle}
          </span>
          <span className="text-gray-300 text-[10px]">•</span>
          <span className="text-[11px] text-gray-400">
            {activity.timestamp}
          </span>
        </div>
      </div>

      {/* Toggle */}
      {onView && (
        <button
          onClick={toggleBlur}
          className="
            p-1.5 rounded-md
            hover:bg-gray-100
            transition
            flex-shrink-0
            opacity-0 group-hover:opacity-100
          "
        >
          {blurred ? (
            <EyeOff className="w-3.5 h-3.5 text-gray-600" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-gray-600" />
          )}
        </button>
      )}
    </div>
  );
};

export default ActivityItem;