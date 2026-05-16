import type { FC } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Calendar,
  CheckSquare,
  Bell,
} from 'lucide-react';
import type { ActivityItemProps } from '../../../types/admin-role-types/admin-dash.types';
import type { ActivityType } from '../../../types/admin-role-types/admin-dash.types';

const ICON_CONFIG: Record<ActivityType, {
  Icon:    typeof GraduationCap;
  bg:      string;
  color:   string;
}> = {
  mentorship: { Icon: GraduationCap, bg: 'bg-blue-50',   color: 'text-[#0f5e8b]' },
  verified:   { Icon: ShieldCheck,   bg: 'bg-blue-50',   color: 'text-[#0f5e8b]' },
  alert:      { Icon: AlertTriangle, bg: 'bg-red-50',    color: 'text-red-500'   },
  payment:    { Icon: CreditCard,    bg: 'bg-gray-100',  color: 'text-gray-500'  },
  session:    { Icon: Calendar,      bg: 'bg-green-50',  color: 'text-green-600' },
  task:       { Icon: CheckSquare,   bg: 'bg-yellow-50', color: 'text-yellow-600'},
  announcement: { Icon: Bell,        bg: 'bg-purple-50', color: 'text-purple-600'},
};

const ActivityItem: FC<ActivityItemProps> = ({ event }) => {
  const { type, title, description, linkText, timeLabel, isAlert } = event;
  const { Icon, bg, color } = ICON_CONFIG[type];

  // Split description around linkText if present
  const parts = linkText
    ? description.split(linkText)
    : [description];

  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl transition-colors ${
      isAlert
        ? 'bg-red-50 border-l-4 border-red-400'
        : 'bg-white border border-gray-100 hover:border-gray-200'
    }`}>
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          {parts[0]}
          {linkText && (
            <span className="font-semibold text-[#0f5e8b] cursor-pointer hover:underline">
              {linkText}
            </span>
          )}
          {parts[1]}
        </p>
      </div>

      {/* Time */}
      <span className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5 ${
        isAlert ? 'text-red-500' : 'text-gray-400'
      }`}>
        {timeLabel}
      </span>
    </div>
  );
};

export default ActivityItem;