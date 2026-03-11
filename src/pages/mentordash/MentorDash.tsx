import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashLayout from '../../components/layout/Dash-layout';
import StatCard from '../../components/mentor-dash-com/statcard/StatCard';
import SalesChart from '../../components/mentor-dash-com/SalesChart';
import CalendarWidget from '../../components/mentor-dash-com/CalendarWidget/CalendarWidget';
import ScheduledSessions from '../../components/mentor-dash-com/ScheduledSessions/ScheduledSessions';
import { GraduationCap, BookOpen, Star, DollarSign } from 'lucide-react';
import { RecentActivityList } from '../../components/mentor-dash-com/RecentActivity';
import { ReviewsList } from '../../components/mentor-dash-com/Reviews';
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
    welcomeDate
  } = useDashboardData();

  const totalStudents = Number(cards?.totalStudents ?? 0);
  const totalMentorships = Number(cards?.totalMentorships ?? 0);
  const averageRating = Number(cards?.averageRating ?? 0);
  const totalRevenue = Number(cards?.totalRevenue ?? 0);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatRevenue = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatRating = (num: number): string => {
    return num.toFixed(1);
  };

  const stats = [
    { title: 'Total Students', value: formatNumber(totalStudents), icon: <GraduationCap /> },
    { title: 'Total Mentorships', value: formatNumber(totalMentorships), icon: <BookOpen /> },
    { title: 'Average Rating', value: formatRating(averageRating), icon: <Star /> },
    { title: 'Total Revenue', value: formatRevenue(totalRevenue), icon: <DollarSign /> },
  ];

  return (
    <DashLayout pageTitle="Dashboard">
      <div className="bg-gray-50 dark:bg-[var(--dark-bg)] min-h-screen px-4 md:px-8 py-4">
        {!isHydrated ? (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold text-lg">Loading...</p>
                  <p className="text-gray-500 text-sm mt-1">Please wait while we prepare your dashboard</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                Welcome back, {displayName}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{welcomeDate}</p>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-xs font-semibold underline hover:no-underline"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white rounded-[20px] border border-gray-200">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-700 font-semibold">Loading...</p>
                    <p className="text-gray-500 text-sm mt-1">Preparing your dashboard data</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <StatCard
                      key={index}
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                  <SalesChart
                    title="Sales"
                    data={revenueData.length > 0 ? revenueData : undefined}
                  />
                  <ReviewsList
                    reviews={reviews}
                    onViewAll={() => navigate('/mentor/mentorships')}
                  />
                </div>
                <div className="space-y-6">
                  <CalendarWidget
                    sessions={sessions.map(s => ({
                      id: s.id,
                      title: s.title,
                      startTime: s.startTime,
                      endTime: s.endTime,
                      type: s.type,
                      date: s.date || new Date().toISOString().split('T')[0]
                    }))}
                  />
                  <ScheduledSessions sessions={sessions} />
                  <RecentActivityList
                    title="Notifications"
                    activities={notifications.map((n) => ({
                      id: n.id,
                      studentName: n.title || 'Notification',
                      action: n.message || '',
                      mentorshipTitle: '',
                      timestamp: n.timestamp,
                      type: 'completion', // generic color
                    }))}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashLayout>
  );
};

export default MentorDash;


