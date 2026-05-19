import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminUsersDashboard,
  useAdminUserDetails,
  ADMIN_USER_DETAILS_KEY
} from '../../../services/admin-role-service/Admindashboardservice';
import type { UserSummaryData } from '../../../types/admin-role-types/admin-dash.types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, Bell, ChevronDown, Loader2, X } from 'lucide-react';
import UserList from './components/UserList';
import { API_BASE_URL } from '../../../services/api';
import SendNotificationModal from './components/SendNotificationModal';
import SendEmailModal from './components/SendEmailModal';
import AssignBadgeModal from './components/AssignBadgeModal';
import UserBadgesModal from './components/UserBadgesModal';

type UnknownBadge = {
  badge?: { id?: number; title?: string };
  badgeId?: number;
  id?: number;
  userBadgeId?: number;
  badgeTitle?: string;
  recognitionNote?: string;
};

const Users: React.FC = () => {
  const [page, setPage] = useState(0);
  const size = 10;
  const [months, setMonths] = useState(6);
  const [period, setPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [selectedUser, setSelectedUser] = useState<UserSummaryData | null>(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isBadgesListModalOpen, setIsBadgesListModalOpen] = useState(false);
  const [badgesListModalMode, setBadgesListModalMode] = useState<'view' | 'remove'>('view');
  const [badgesListUser, setBadgesListUser] = useState<UserSummaryData | null>(null);

  const queryClient = useQueryClient();

  // جلب البيانات من الـ API
  const { data, isLoading, isError } = useAdminUsersDashboard(months, page, size);

  const dashboardSummary = data?.apiResponse?.dashboardSummary;
  const monthlyUsers = dashboardSummary?.monthlyUsers || [];
  const allUsersPaginated = dashboardSummary?.allUsersPaginated;
  const users = allUsersPaginated?.content || [];
  const totalElements = allUsersPaginated?.totalElements || 0;
  const totalPages = allUsersPaginated?.totalPages || 1;

  // تعيين أول مستخدم بشكل تلقائي فقط للشاشات الكبيرة جداً (Desktop XL)
  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      const isLargeDesktop = window.innerWidth >= 1280; // xl breakpoint
      if (isLargeDesktop) {
        setSelectedUser(users[0]);
      }
    }
  }, [users, selectedUser]);

  // جلب تفاصيل المستخدم
  const { data: detailsData, isLoading: isDetailsLoading } = useAdminUserDetails(selectedUser?.id || null);
  const studentDetails = detailsData?.apiResponse?.studentDetails;
  const mentorDetails = detailsData?.apiResponse?.mentorDetails;
  const userDetails = mentorDetails || studentDetails;
  const isStudent = selectedUser?.roleName === 'STUDENT' || !!studentDetails;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-screen text-slate-500 gap-2">
        <Loader2 className="animate-spin text-primary-500" /> Loading user directory...
      </div>
    );
  }

  if (isError || !data) {
    return <div className="p-8 flex justify-center items-center h-screen text-red-500">Error loading user directory data.</div>;
  }

  // إعداد بيانات الشارت
  let chartData = [];
  if (period === 'Monthly') {
    const slicedMonthlyUsers = monthlyUsers.slice(-months);
    chartData = slicedMonthlyUsers.map((m) => ({
      name: m.month.substring(0, 3),
      users: m.totalUsers,
    }));
  } else {
    const yearlyMap: Record<number, number> = {};
    monthlyUsers.forEach(m => {
      yearlyMap[m.year] = (yearlyMap[m.year] || 0) + m.totalUsers;
    });
    chartData = Object.entries(yearlyMap).map(([year, users]) => ({
      name: year,
      users: users as number
    }));
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // مكوّن الشريط الجانبي لعرض تفاصيل المستخدم (تم حمايته من التكرار)
  const SidebarContent = () => {
    if (!selectedUser) return null;
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        {/* زر الإغلاق يظهر في كل الشاشات ما عدا الشاشات الكبيرة جداً */}
        <button
          onClick={() => setSelectedUser(null)}
          className="xl:hidden absolute top-4 right-4 z-20 text-white bg-slate-900/30 hover:bg-slate-900/50 p-1.5 rounded-full transition-all focus:outline-none"
          title="Close details"
        >
          <X size={16} />
        </button>
        <div className="h-28 bg-primary-500"></div>

        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
            {selectedUser.profileImageUrl ? (
              <img src={`${API_BASE_URL}${selectedUser.profileImageUrl}`} alt={selectedUser.firstName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold text-3xl">
                {selectedUser.firstName ? selectedUser.firstName[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </div>

        <div className="pt-14 pb-6 px-6 flex flex-col items-center text-center border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</h2>
          <p className="text-sm text-slate-500 font-medium capitalize mt-1">
            {isStudent
              ? `student ${studentDetails?.educationalLevel ? `• ${studentDetails.educationalLevel.toLowerCase()}` : ''}`
              : (mentorDetails?.jobTitle || `${selectedUser.roleName.toLowerCase()}`)
            }
          </p>

          <div className="flex w-full gap-3 mt-6">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex-1 bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] text-white py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              Send Email
            </button>
            <button
              onClick={() => setIsNotifModalOpen(true)}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Bell size={16} /> Notification
            </button>
          </div>
        </div>

        {isStudent ? (
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
            <div className="p-4 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Enrollments</span>
              <span className="text-lg font-bold text-primary-600 mt-1">{studentDetails?.totalEnrollments ?? 0}</span>
            </div>
            <div className="p-4 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed</span>
              <span className="text-lg font-bold text-primary-600 mt-1">{studentDetails?.totalCompletedMentorships ?? 0}</span>
            </div>
            <div className="p-4 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Badges</span>
              <span className="text-lg font-bold text-primary-600 mt-1">{studentDetails?.totalBadgesEarned ?? 0}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
            <div className="p-4 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sessions</span>
              <span className="text-lg font-bold text-primary-600 mt-1">{mentorDetails?.totalSessions ?? 0}</span>
            </div>
            <div className="p-4 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Students</span>
              <span className="text-lg font-bold text-primary-600 mt-1">{mentorDetails?.totalStudents ?? 0}</span>
            </div>
            <div className="p-4 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Score</span>
              <span className="text-lg font-bold text-primary-600 mt-1">
                {mentorDetails?.averageRating ? mentorDetails.averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Short Bio</h3>
            <p className="text-sm text-slate-600 leading-relaxed min-h-[40px]">
              {userDetails?.bio && userDetails.bio.trim() !== "" ? userDetails.bio : `No bio provided for this user.`}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Achievement</h3>
            <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-lg p-3 flex items-center gap-3 text-sm font-medium">
              <Award className="text-yellow-500" size={20} />
              {userDetails && !isStudent && mentorDetails && mentorDetails.totalSessions > 10 ? 'Top Contributor 2026' : 'Active Member'}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Badges</h3>
            {userDetails?.adminBadges && userDetails.adminBadges.length > 0 ? (
              <div className="flex flex-col gap-2">
                {userDetails.adminBadges.map((badge: unknown, index: number) => {
                  const typedBadge = badge as UnknownBadge;
                  const bId = typedBadge.badge?.id ?? typedBadge.badgeId ?? typedBadge.id ?? index;
                  const title = typedBadge.badge?.title ?? typedBadge.badgeTitle ?? 'Admin Badge';
                  const note = typedBadge.recognitionNote ?? '';
                  const uBadgeId = typedBadge.id ?? typedBadge.userBadgeId ?? typedBadge.badgeId;

                  const emoji = bId === 1 ? '🏆' : bId === 2 ? '👑' : bId === 3 ? '⭐' : bId === 4 ? '🤝' : '🎨';
                  const colorClass = bId === 1 ? 'bg-amber-50 text-amber-800 border-amber-100'
                    : bId === 2 ? 'bg-blue-50 text-blue-800 border-blue-100'
                      : bId === 3 ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        : bId === 4 ? 'bg-purple-50 text-purple-800 border-purple-100'
                          : 'bg-rose-50 text-rose-800 border-rose-100';

                  return (
                    <div key={uBadgeId || index} className={`flex items-center justify-between p-2.5 rounded-xl border text-sm font-medium transition-all ${colorClass}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-semibold">{title}</span>
                          {note && <span className="text-[10px] opacity-70 mt-0.5">{note}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                No admin badges assigned yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 bg-slate-50/50 min-h-screen font-sans text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">User Directory</h1>
        <p className="text-slate-500 text-xs sm:text-sm">Manage and monitor all active mentors, students, and system staff.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        {/* Left Column (Table & Chart) */}
        <div className="flex-1 flex flex-col gap-6 min-h-0 w-full">
          {/* Chart Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">User Traffic</h2>
                <p className="text-slate-400 text-xs">Active users by period</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-sm w-full sm:w-auto">
                <div className="flex bg-slate-100 rounded-lg p-1 self-start sm:self-auto">
                  <button
                    onClick={() => setPeriod('Monthly')}
                    className={`px-3 sm:px-4 py-1.5 rounded-md font-semibold text-xs transition-colors ${period === 'Monthly' ? 'bg-white text-primary-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setPeriod('Yearly')}
                    className={`px-3 sm:px-4 py-1.5 rounded-md font-semibold text-xs transition-colors ${period === 'Yearly' ? 'bg-white text-primary-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Yearly
                  </button>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-800 font-bold text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap">
                    TOTAL USERS
                  </span>
                  <div className="relative min-w-[130px]">
                    <select
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold text-xs shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer pr-8"
                    >
                      <option value={3}>Last 3 Months</option>
                      <option value={6}>Last 6 Months</option>
                      <option value={12}>Last 12 Months</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-48 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="users" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 640 ? 24 : 48}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 || index === chartData.length - 2 ? '#0f5e8b' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* جدول المستخدمين */}
          <div className="w-full overflow-x-auto">
            <UserList
              users={users}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              page={page}
              size={size}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onSendEmailClick={(user) => {
                setSelectedUser(user);
                setIsEmailModalOpen(true);
              }}
              onAssignBadgeClick={(user) => {
                setSelectedUser(user);
                setIsBadgeModalOpen(true);
              }}
              onShowBadgesClick={(user) => {
                setBadgesListUser(user);
                setBadgesListModalMode('view');
                setIsBadgesListModalOpen(true);
              }}
              onRemoveBadgeClick={(user) => {
                setBadgesListUser(user);
                setBadgesListModalMode('remove');
                setIsBadgesListModalOpen(true);
              }}
            />
          </div>
        </div>

        {/* Right Column - Sidebar (فقط للشاشات الكبيرة جداً Desktop XL >= 1280px) */}
        {selectedUser && (
          <div className="hidden xl:flex xl:w-80 flex-shrink-0 flex-col gap-6 relative">
            {isDetailsLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                <Loader2 className="animate-spin text-primary-500" size={32} />
              </div>
            )}
            <SidebarContent />
          </div>
        )}

        {/* Slide-over Drawer (للشاشات المتوسطة والصغيرة < 1280px) */}
        {selectedUser && (
          <div className="xl:hidden fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setSelectedUser(null)}
            />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto z-10 p-4 sm:p-6 border-l border-slate-100">
              {isDetailsLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary-500" size={32} />
                </div>
              )}
              <div className="flex-1 mt-4">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <SendNotificationModal
            isOpen={isNotifModalOpen}
            onClose={() => setIsNotifModalOpen(false)}
            userId={selectedUser.id}
            userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          />
          <SendEmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            userId={selectedUser.id}
            userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          />
          <AssignBadgeModal
            isOpen={isBadgeModalOpen}
            onClose={() => setIsBadgeModalOpen(false)}
            userId={selectedUser.id}
            userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ADMIN_USER_DETAILS_KEY })}
          />
        </>
      )}

      {badgesListUser && (
        <UserBadgesModal
          isOpen={isBadgesListModalOpen}
          onClose={() => {
            setIsBadgesListModalOpen(false);
            setBadgesListUser(null);
          }}
          userId={badgesListUser.id}
          userName={`${badgesListUser.firstName} ${badgesListUser.lastName}`}
          mode={badgesListModalMode}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ADMIN_USER_DETAILS_KEY })}
        />
      )}
    </div>
  );
};

export default Users;