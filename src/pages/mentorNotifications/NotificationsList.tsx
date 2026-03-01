
import type { FC } from 'react';
import { useState, useMemo } from 'react';

import DashLayout from '../../components/layout/Dash-layout';
import NotificationTabs from '../../components/mentor-notifications-com/NotificationTabs/NotificationTabs';
import NotificationCard from '../../components/mentor-notifications-com/NotificationCard/NotificationCard';
import type { Notification } from '../../types/mentornotification.types';

const NotificationsList: FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Calculate unread count
  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [activeTab, notifications]);

  const handleAction = (id: string) => {
    console.log('Action clicked for notification:', id);
    // TODO: Navigate to action URL
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, isNew: false }))
    );
  };

  return (
    <DashLayout pageTitle="Notifications" >
      <div className="bg-[#F7F7F8] min-h-[calc(100vh-65px)] p-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Notifications
            </h1>
            <p className="text-sm text-gray-500">
              You have <span className="font-semibold text-gray-900">{unreadCount}</span> unread notifications
            </p>
          </div>

          {/* Tabs & Mark All Button */}
          <div className="flex items-center justify-between mb-3">
            <NotificationTabs
              activeTab={activeTab}
              allCount={notifications.length}
              unreadCount={unreadCount}
              onTabChange={setActiveTab}

              onMarkAllRead={handleMarkAllAsRead}
            />
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onAction={handleAction}
                  onDismiss={handleDismiss}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">🔔</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashLayout>
  );
};

export default NotificationsList;