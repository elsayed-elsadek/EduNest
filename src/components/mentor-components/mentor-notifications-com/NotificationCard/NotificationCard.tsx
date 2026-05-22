
import type { FC } from 'react';
import { Calendar, MessageCircle, X, Clock, Play, Eye, Bell, Megaphone, CheckSquare, FolderOpen, HelpCircle, Award, Scroll, Video, BookOpen } from 'lucide-react';
import type { Notification } from '../../../../types/mentornotification.types';
import { useMarkReadOnView } from '../../../../hooks/Usemarkreadonview';

interface NotificationCardProps {
  notification: Notification;
  onAction?:   (id: string) => void;
  onDismiss?:  (id: string) => void;
  onMarkRead?: (id: string) => void;
}

const NotificationCard: FC<NotificationCardProps> = ({
  notification,
  onAction,
  onDismiss,
  onMarkRead,
}) => {
  const iconConfig = {
    announcement: { icon: Megaphone,   bg: 'bg-[#EFF6FF]', color: 'text-[#2563EB]', border: 'border-[#2563EB]' },
    quiz:         { icon: BookOpen,    bg: 'bg-[#FEF3C7]', color: 'text-[#B45309]', border: 'border-[#B45309]' },
    session:      { icon: Calendar,    bg: 'bg-[#EFF6FF]', color: 'text-[#2563EB]', border: 'border-[#2563EB]' },
    task:         { icon: CheckSquare, bg: 'bg-[#ECFDF5]', color: 'text-[#059669]', border: 'border-[#059669]' },
    project:      { icon: FolderOpen,  bg: 'bg-[#F5F3FF]', color: 'text-[#7C3AED]', border: 'border-[#7C3AED]' },
    support:      { icon: HelpCircle,  bg: 'bg-[#ECFDF5]', color: 'text-[#0F766E]', border: 'border-[#0F766E]' },
    badge:        { icon: Award,       bg: 'bg-[#FDF2F8]', color: 'text-[#C026D3]', border: 'border-[#C026D3]' },
    certificate:  { icon: Scroll,      bg: 'bg-[#ECFEFF]', color: 'text-[#0891B2]', border: 'border-[#0891B2]' },
    live_session: { icon: Video,      bg: 'bg-[#FEF2F2]', color: 'text-[#B91C1C]', border: 'border-[#B91C1C]' },
    message:      { icon: MessageCircle,bg: 'bg-[#F0FDF4]', color: 'text-[#15803D]', border: 'border-[#15803D]' },
    general:      { icon: Bell,       bg: 'bg-[#EFF6FF]', color: 'text-[#2563EB]', border: 'border-[#2563EB]' },
  };

  const config = iconConfig[notification.type] || iconConfig.general;
  const Icon   = config.icon;

  // Auto mark-read when card is visible
  const cardRef = useMarkReadOnView({
    id:         notification.id,
    isRead:     notification.isRead,
    onMarkRead: onMarkRead ?? (() => {}),
    delay: 1500,
  });

  return (
    <div
      ref={cardRef}
      className={`
        relative bg-white rounded-[20px] p-4 sm:p-6
        border-l-[6px] transition-all duration-300
        hover:shadow-lg mb-4 group
        ${!notification.isRead ? `${config.border} shadow-sm` : 'border-gray-100'}
      `}
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(notification.id)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0 border border-black/5`}>
          <Icon className={`w-6 h-6 ${config.color}`} strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-800 dark:text-gray-200 truncate">
                {notification.title}
              </h3>
              {notification.isNew && (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0">
                  New
                </span>
              )}
            </div>
            <p className="text-[13px] sm:text-[14px] text-gray-500 leading-relaxed line-clamp-2">
              {notification.message}
            </p>
          </div>

          <div className="flex items-center md:flex-row-reverse gap-4 sm:gap-6 shrink-0 mt-2 md:mt-0 md:ml-auto">
            <div className="flex items-center gap-1.5 text-gray-400 min-w-[80px] justify-end">
              <Clock className="w-4 h-4" />
              <span className="text-[12px] font-medium whitespace-nowrap">{notification.timestamp}</span>
            </div>

            {notification.actionLabel && (
              <button
                onClick={() => onAction?.(notification.id)}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:shadow-lg transition-all active:scale-95 text-sm font-bold h-[40px] w-[110px] shrink-0"
              >
                <span className="truncate">{notification.actionLabel}</span>
                {notification.actionLabel.toLowerCase() === 'join'
                  ? <Play className="w-3 h-3 fill-current shrink-0" />
                  : <Eye  className="w-4 h-4 shrink-0" />
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;