import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashLayout from '../../../components/layout/Dash-layout';
import SalesChart from '../../../components/mentor-components/mentor-dash-com/SalesChart';
import CalendarWidget from '../../../components/mentor-components/mentor-dash-com/CalendarWidget/CalendarWidget';
import ScheduledSessions from '../../../components/mentor-components/mentor-dash-com/ScheduledSessions/ScheduledSessions';
import { GraduationCap, BookOpen, Star, DollarSign } from 'lucide-react';
import { RecentActivityList } from '../../../components/mentor-components/mentor-dash-com/RecentActivity';
import { ReviewsList } from '../../../components/mentor-components/mentor-dash-com/Reviews';
import DashboardStatCard from '../../../components/mentor-components/mentor-dash-com/DashboardStatCard';
import { useDashboardData } from './hooks/useDashboardData';

const MentorDash: React.FC = () => {
  const navigate = useNavigate();

  const {
    cards,
    sessions,
    reviews,
    revenueData,
    notifications,
    loading,
    error,
    isHydrated,
    displayName,
    welcomeDate,
    // Per-section loading
    reviewsLoading,
    sessionsLoading,
    // Pagination meta
    reviewPagination,
    sessionPagination,
    notificationPagination,
    // Pagination handlers
    handleReviewPageChange,
    handleSessionPageChange,
    handleNotificationPageChange,
  } = useDashboardData();

  // ── Formatters ────────────────────────────────────────────────────────────────
  const formatNumber = (num: number): string =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

  const formatRevenue = (num: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  const formatRating = (num: number): string => num.toFixed(1);

  const stats = [
    {
      title: 'Total Students',
      value: formatNumber(Number(cards?.totalStudents ?? 0)),
      icon: GraduationCap,
      path: '/mentor/students',
    },
    {
      title: 'Total Mentorships',
      value: formatNumber(Number(cards?.totalMentorships ?? 0)),
      icon: BookOpen,
      path: '/mentor/mentorships',
    },
    {
      title: 'Average Rating',
      value: formatRating(Number(cards?.averageRating ?? 0)),
      icon: Star,
    },
    {
      title: 'Total Revenue',
      value: formatRevenue(Number(cards?.totalRevenue ?? 0)),
      icon: DollarSign,
    },
  ];

  // ── Loading skeleton (pre-hydration) ─────────────────────────────────────────
  if (!isHydrated) {
    return (
      <DashLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[var(--dark-bg)]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary-from)] border-r-[var(--primary-from)] animate-spin" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Loading...</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              Please wait while we prepare your dashboard
            </p>
          </div>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout pageTitle="Dashboard">
      <div className="bg-gray-50 dark:bg-[var(--dark-bg)] min-h-screen px-4 md:px-8 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white capitalize tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{welcomeDate}</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-semibold">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs font-semibold underline hover:no-underline opacity-80 hover:opacity-100"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {loading ? (
            /* ── Loading state ─────────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center gap-4 py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary-from)] border-r-[var(--primary-from)] animate-spin" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Preparing your dashboard data</p>
            </div>
          ) : (
            <>
              {/* ── Stat Cards ─────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 stateMentorCard">
                {stats.map((stat) => (
                  <DashboardStatCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    to={stat.path}
                  />
                ))}
              </div>

              {/* ── Main Grid ─────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mainDashDiv">
           
                {/* Left column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                  <SalesChart
                    title="Sales"
                    data={revenueData.length > 0 ? revenueData : undefined}
                  />

                  <ReviewsList
                    reviews={reviews}
                    onViewAll={() => navigate('/mentor/mentorships')}
                    currentPage={reviewPagination.page}
                    totalPages={reviewPagination.totalPages}
                    onPageChange={handleReviewPageChange}
                    isLoading={reviewsLoading}
                  />
                </div>

                {/* Right column (1/3) */}
                <div className="space-y-6 mentorDashRighColumn">
                    <CalendarWidget
                      selectedDate={new Date()}
                      sessions={sessions.map((s) => ({
                        id: s.id,
                        mentorshipId: s.mentorshipId,
                        mentorshipTitle: s.mentorshipTitle,
                        title: s.title,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        type: s.type,
                        date: s.date ?? new Date().toLocaleDateString('en-CA'),
                      }))}
                    />

                  <ScheduledSessions
                    sessions={sessions}
                    currentPage={sessionPagination.page}
                    totalPages={sessionPagination.totalPages}
                    onPageChange={handleSessionPageChange}
                    isLoading={sessionsLoading}
                  />

                  <RecentActivityList
                    title="Notifications"
                    activities={notifications.map((n) => ({
                      id: n.id,
                      studentName: n.title || 'Notification',
                      action: n.message || '',
                      mentorshipTitle: '',
                      timestamp: n.timestamp ?? (n.rawTime ?? new Date().toISOString()),
                      type: 'completion',
                    }))}
                    currentPage={notificationPagination.page}
                    totalPages={notificationPagination.totalPages}
                    onPageChange={handleNotificationPageChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashLayout>
  );
};

export default MentorDash;
