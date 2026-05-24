import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { Bell,  ChevronLeft, ChevronRight } from 'lucide-react';
import DashLayout from '../../../components/layout/Dash-layout';
import NotificationTabs from '../../../components/mentor-components/mentor-notifications-com/NotificationTabs/NotificationTabs';
import NotificationCard from '../../../components/mentor-components/mentor-notifications-com/NotificationCard/NotificationCard';
import { useNotifications } from '../../../hooks/Usenotifications';

const PAGE_SIZE = 6;

const NotificationsList: FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(0);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    handleMarkRead,
    handleMarkAllRead,
    handleDismiss,
    handleDeleteAll,
  } = useNotifications();

  const filtered = useMemo(() => {
    const list = activeTab === 'unread'
      ? notifications.filter(n => !n.isRead)
      : notifications;
    return list;
  }, [activeTab, notifications]);

  // reset to page 0 when tab changes
  const handleTabChange = (tab: 'all' | 'unread') => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

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

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <NotificationTabs
              activeTab={activeTab}
              allCount={notifications.length}
              unreadCount={unreadCount}
              onTabChange={handleTabChange}
              onMarkAllRead={handleMarkAllRead}
              onDeleteAll={notifications.length > 0 ? handleDeleteAll : undefined}
            />
          </div>

          {/* List */}
          <div className="space-y-4">
            {loading ? (
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
            ) : paginated.length > 0 ? (
              paginated.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onAction={handleMarkRead}
                  onMarkRead={handleMarkRead}
                  onDismiss={handleDismiss}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'unread'
                    ? "You're all caught up!"
                    : "You don't have any notifications yet."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                           text-gray-400 hover:border-gray-300 hover:text-gray-600
                           disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition
                    ${i === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                           text-gray-400 hover:border-gray-300 hover:text-gray-600
                           disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>
      </div>
    </DashLayout>
  );
};

export default NotificationsList;