import type { FC } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Calendar,
  CheckSquare,
  Bell,
  BookOpen,
  FolderOpen,
  HelpCircle,
  Award,
  Scroll,
  Video,
} from 'lucide-react';
import type { ActivityItemProps } from '../../../types/admin-role-types/admin-dash.types';
import type { ActivityType } from '../../../types/admin-role-types/admin-dash.types';

const ICON_CONFIG: Record<ActivityType, {
  Icon:    typeof GraduationCap;
  bg:      string;
  color:   string;
  border:  string;
  label:   string;
}> = {
  mentorship:   { Icon: GraduationCap, bg: 'bg-blue-50',   color: 'text-[#0f5e8b]', border: 'border-l-blue-500',    label: 'Mentorship' },
  verified:     { Icon: ShieldCheck,   bg: 'bg-blue-50',   color: 'text-[#0f5e8b]', border: 'border-l-blue-500',    label: 'Verified' },
  alert:        { Icon: AlertTriangle, bg: 'bg-red-50',    color: 'text-red-500',     border: 'border-l-red-500',     label: 'Alert' },
  payment:      { Icon: CreditCard,    bg: 'bg-gray-100',  color: 'text-gray-500',    border: 'border-l-gray-400',    label: 'Payment' },
  session:      { Icon: Calendar,      bg: 'bg-green-50',  color: 'text-green-600',   border: 'border-l-green-500',   label: 'Session' },
  task:         { Icon: CheckSquare,   bg: 'bg-yellow-50', color: 'text-yellow-600',  border: 'border-l-yellow-500',  label: 'Task' },
  announcement: { Icon: Bell,         bg: 'bg-purple-50', color: 'text-purple-600',  border: 'border-l-purple-500',  label: 'Announcement' },
  quiz:         { Icon: BookOpen,     bg: 'bg-amber-50',  color: 'text-amber-600',   border: 'border-l-amber-500',   label: 'Quiz' },
  project:      { Icon: FolderOpen,   bg: 'bg-violet-50', color: 'text-violet-600',  border: 'border-l-violet-500',  label: 'Project' },
  support:      { Icon: HelpCircle,   bg: 'bg-emerald-50',color: 'text-emerald-600',  border: 'border-l-emerald-500', label: 'Support' },
  badge:        { Icon: Award,        bg: 'bg-fuchsia-50',color: 'text-fuchsia-600', border: 'border-l-fuchsia-500', label: 'Badge' },
  certificate:  { Icon: Scroll,       bg: 'bg-cyan-50',   color: 'text-cyan-600',    border: 'border-l-cyan-500',    label: 'Certificate' },
  live_session: { Icon: Video,        bg: 'bg-red-50',    color: 'text-red-600',     border: 'border-l-rose-500',    label: 'Live Session' },
};

const ActivityItem: FC<ActivityItemProps> = ({ event }) => {
  const { type, title, description, linkText, timeLabel, isAlert } = event;
  const { Icon, bg, color, border, label } = ICON_CONFIG[type];

  // Split description around linkText if present
  const parts = linkText
    ? description.split(linkText)
    : [description];

  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 ${
      isAlert
        ? 'bg-red-50 border border-red-200 border-l-4 border-l-red-400 shadow-sm'
        : `bg-white border border-gray-100 hover:border-gray-200 ${border} shadow-sm`
    }`}>
      {/* Icon */}
      <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className={`text-sm font-bold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>
            {title}
          </p>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${bg} ${color}`}>
            {label}
          </span>
        </div>
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