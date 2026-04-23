import type { FC } from 'react';
import { CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTime: (date: Date) => string;
}

const NotificationCard: FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  formatTime,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className={`group p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
      !notification.read
        ? 'bg-[#0c2d48]/5 border-[#0c2d48]/20 shadow-sm'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100' :
          notification.type === 'warning' ? 'bg-amber-100' :
          notification.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {notification.title}
                </h4>
                {!notification.read && (
                  <span className="inline-block w-2 h-2 bg-[#0c2d48] rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500">
                {formatTime(notification.timestamp)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <CheckCircle className="w-4 h-4 text-[#0c2d48]" />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;