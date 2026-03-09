
import type { FC } from 'react';
import { Calendar, FileText, MessageCircle, X, Clock, Play, Eye } from 'lucide-react';
import type { Notification } from '../../../types/mentornotification.types';

interface NotificationCardProps {
  notification: Notification;
  onAction?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const NotificationCard: FC<NotificationCardProps> = ({
  notification,
  onAction,
  onDismiss,
}) => {
  const iconConfig = {
    session: { icon: Calendar, bg: 'bg-[#FFF5F5]', color: 'text-[#FF5C5C]', border: 'border-[#FF5C5C]' },
    assignment: { icon: FileText, bg: 'bg-[#FFF7ED]', color: 'text-[#F97316]', border: 'border-[#F97316]' },
    message: { icon: MessageCircle, bg: 'bg-[#FFFBEB]', color: 'text-[#F59E0B]', border: 'border-[#F59E0B]' },
    general: { icon: FileText, bg: 'bg-[#F0F9FF]', color: 'text-[#0EA5E9]', border: 'border-[#0EA5E9]' },
  };

  const config = iconConfig[notification.type] || iconConfig.general;
  const Icon = config.icon;

  return (
    <div
      className={`
        relative bg-white rounded-[20px] p-4 sm:p-6 
        border-l-[6px] transition-all duration-300
        hover:shadow-lg mb-4 group
        ${!notification.isRead ? `${config.border} shadow-sm` : 'border-gray-100'}
      `}
    >
      {/* Dismiss Button - Top Right */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(notification.id)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Icon Container */}
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0 border border-black/5`}>
          <Icon className={`w-6 h-6 ${config.color}`} strokeWidth={2.5} />
        </div>

        {/* Main Content Area */}
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
            {/* Time */}
            <div className="flex items-center gap-1.5 text-gray-400 min-w-[80px] justify-end">
              <Clock className="w-4 h-4" />
              <span className="text-[12px] font-medium whitespace-nowrap">{notification.timestamp}</span>
            </div>

            {/* Action Button */}
            {notification.actionLabel && (
              <button
                onClick={() => onAction?.(notification.id)}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:shadow-lg transition-all active:scale-95 text-sm font-bold h-[40px] w-[110px] shrink-0"
              >
                <span className="truncate">{notification.actionLabel}</span>
                {notification.actionLabel.toLowerCase() === 'join' ? (
                  <Play className="w-3 h-3 fill-current shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 shrink-0" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;


