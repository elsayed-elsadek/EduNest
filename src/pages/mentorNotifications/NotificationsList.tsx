import type { FC } from 'react';
import { useState, useMemo } from 'react';
import DashLayout       from '../../components/layout/Dash-layout';
import NotificationTabs from '../../components/mentor-notifications-com/NotificationTabs/NotificationTabs';
import NotificationCard from '../../components/mentor-notifications-com/NotificationCard/NotificationCard';
import { useNotifications } from '../../hooks/Usenotifications';

const NotificationsList: FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const {
    notifications,
    unreadCount,
    loading,
    error,
    handleMarkRead,
    handleMarkAllRead,
    handleDismiss,
  } = useNotifications();

  // Filter by active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [activeTab, notifications]);

  const handleAction = (id: string) => {
    // Mark as read when action button is clicked
    handleMarkRead(id);
  };

  const handleDismissCard = (id: string) => {
    handleDismiss(id);
  };

  return (
    <DashLayout pageTitle="Notifications">
      <div className="bg-gray-50 dark:bg-[var(--dark-bg)] min-h-[calc(100vh-65px)] p-4">
        <div className="max-w-[1200px] mx-auto">

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h1>
            <p className="text-sm text-gray-500">
              You have{' '}
              <span className="font-semibold text-gray-900">{unreadCount}</span>{' '}
              unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center justify-between mb-3">
            <NotificationTabs
              activeTab={activeTab}
              allCount={notifications.length}
              unreadCount={unreadCount}
              onTabChange={setActiveTab}
              onMarkAllRead={handleMarkAllRead}
            />
          </div>

          {/* List */}
          <div className="space-y-4">
            {loading ? (
              /* Skeleton */
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onAction={handleAction}
                  onMarkRead={handleMarkRead}
                  onDismiss={handleDismissCard}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">🔔</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
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