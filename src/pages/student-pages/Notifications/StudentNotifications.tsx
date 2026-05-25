
import type { FC } from 'react';
import { useState, useMemo } from 'react';
import {
  Bell,
  CalendarDays,
  MessageCircle,
  Megaphone,
  CheckSquare,
  FolderOpen,
  HelpCircle,
  Award,
  Scroll,
  Video,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import { useNotificationsContext } from '../../../context/NotificationsContext';
import type { Notification, NotificationType } from '../../../types/mentornotification.types';
import RelativeTime from '../../../components/common/RelativeTime';

//Icon configuration (matches NotificationType)
const NOTIF_CONFIGS: Record<NotificationType, {
  bg: string;
  text: string;
  icon: React.ReactNode;
}> = {
  announcement: { bg: 'bg-purple-100', text: 'text-purple-600', icon: <Megaphone className="w-5 h-5" /> },
  quiz: { bg: 'bg-amber-100', text: 'text-amber-600', icon: <BookOpen className="w-5 h-5" /> },
  session: { bg: 'bg-green-100', text: 'text-green-600', icon: <CalendarDays className="w-5 h-5" /> },
  task: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <CheckSquare className="w-5 h-5" /> },
  project: { bg: 'bg-violet-100', text: 'text-violet-600', icon: <FolderOpen className="w-5 h-5" /> },
  support: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: <HelpCircle className="w-5 h-5" /> },
  badge: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600', icon: <Award className="w-5 h-5" /> },
  certificate: { bg: 'bg-cyan-100', text: 'text-cyan-600', icon: <Scroll className="w-5 h-5" /> },
  live_session: { bg: 'bg-red-100', text: 'text-red-600', icon: <Video className="w-5 h-5" /> },
  mentorship: { bg: 'bg-blue-100', text: 'text-blue-600', icon: <GraduationCap className="w-5 h-5" /> },
  review: { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: <MessageCircle className="w-5 h-5" /> },
};

const PAGE_SIZE = 6;

const Pagination: FC<{ current: number; total: number; onChange: (p: number) => void }> = ({ current, total, onChange }) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-end mt-4">
      <button
        onClick={() => onChange(Math.max(0, current - 1))}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className="px-3 py-1 rounded-md text-sm"
          style={current === i ? { backgroundColor: '#0c2d48', color: '#fff' } : undefined}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(total - 1, current + 1))}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Icon component ──────────────────────────────────────────────────────────
const NotifIcon: FC<{ type: NotificationType; isRead: boolean }> = ({ type, isRead }) => {
  const config = NOTIF_CONFIGS[type] ?? NOTIF_CONFIGS.announcement;
  return (
    <div className={`w-10 h-10 rounded-full ${isRead ? 'bg-gray-100' : config.bg} flex items-center justify-center flex-shrink-0 text-lg`}>
      <div className={isRead ? 'text-gray-600' : config.text}>{config.icon}</div>
    </div>
  );
};

// ── Single notification card ─────────────────────────────────────────────────
const NotifCard: FC<{
  notification: Notification;
  onMarkRead:  (id: string) => void;
  onDismiss:   (id: string) => void;
}> = ({ notification, onMarkRead, onDismiss }) => {
  const { id, type, title, message, isRead, isNew, rawTime } = notification;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
        !isRead
          ? 'bg-blue-50/40 border-blue-100'
          : 'bg-white border-gray-100 hover:bg-gray-50'
      }`}
    >
      <NotifIcon type={type} isRead={isRead} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
              {title}
            </p>
            {isNew && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-100 rounded-full uppercase tracking-wide">
                New
              </span>
            )}
          </div>
          <RelativeTime
            isoDate={rawTime}
            className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0"
          />
        </div>

        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{message}</p>

        <div className="flex items-center gap-3 mt-2">
          {!isRead && (
            <button
              onClick={() => onMarkRead(id)}
              className="text-xs font-medium text-[#0c2d48] hover:underline transition-colors"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={() => onDismiss(id)}
            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page 
const Notifications: FC = () => {
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
  } = useNotificationsContext();

  const filtered = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [activeTab, notifications]);

  const handleTabChange = (tab: 'all' | 'unread') => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {/* ── Frame Header ── */}
          <div className="bg-[#0c2d48] px-7 py-5">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">
              Student Portal
            </p>
            <h1 className="text-xl font-bold text-white">Notifications Center</h1>
            <p className="text-xs text-white/55 mt-1">
              Stay updated with your latest activities and important announcements.
            </p>
          </div>

          {/* ── Content ── */}
          <div className="px-7 py-5 space-y-4">

            {/* ── Sub-header ── */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                You have{' '}
                <span className="font-semibold text-gray-900">{unreadCount}</span>{' '}
                unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-[#0c2d48] hover:underline transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="text-xs font-medium text-red-500 hover:underline transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {(['all', 'unread'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
                </button>
              ))}
            </div>

            {/* ── Error ── */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* ── List ── */}
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 rounded-xl border border-gray-100 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : paginated.length > 0 ? (
                paginated.map(n => (
                  <NotifCard
                    key={n.id}
                    notification={n}
                    onMarkRead={handleMarkRead}
                    onDismiss={handleDismiss}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">No notifications</h3>
                  <p className="text-xs text-gray-400">
                    {activeTab === 'unread'
                      ? "You're all caught up!"
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              )}
            </div>

            <Pagination
              current={safePage}
              total={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        </div>
      </main>

    </div>
  );
};

export default Notifications;