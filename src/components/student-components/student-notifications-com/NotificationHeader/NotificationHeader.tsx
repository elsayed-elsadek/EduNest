import type { FC } from 'react';
import { Bell } from 'lucide-react';

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

const NotificationHeader: FC<NotificationHeaderProps> = ({
  unreadCount,
  onMarkAllAsRead,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#0c2d48]/10">
          <Bell className="w-5 h-5 text-[#0c2d48]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          className="px-4 py-2 text-sm font-medium text-[#0c2d48] hover:bg-[#0c2d48]/10 rounded-lg transition-colors"
        >
          Mark all as read
        </button>
      )}
    </div>
  );
};

export default NotificationHeader;