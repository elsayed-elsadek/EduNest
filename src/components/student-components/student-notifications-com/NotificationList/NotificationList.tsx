import type { FC } from 'react';
import NotificationCard from '../NotificationCard/NotificationCard';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTime: (date: Date) => string;
}

const NotificationList: FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  formatTime,
}) => {
  return (
    <div className="space-y-4">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          formatTime={formatTime}
        />
      ))}
    </div>
  );
};

export default NotificationList;