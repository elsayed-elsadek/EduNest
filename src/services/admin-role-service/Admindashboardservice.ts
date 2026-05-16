import api from '../api';
import { useQuery } from '@tanstack/react-query';
import type {
  AdminDashboardApiResponse,
  StatCardData,
  ChartPoint,
  TopMentor,
  ActivityEvent,
  ActivityType,
} from '../../types/admin-role-types/admin-dash.types';

export const ADMIN_DASHBOARD_KEY = ['admin', 'dashboard', 'full'] as const;

const fetchAdminDashboard = async (months: number): Promise<AdminDashboardApiResponse> => {
  const { data } = await api.get<AdminDashboardApiResponse>('api/v1/admin/dashboard/full', {
    params: {
      months,               
      notificationPage: 0,
      notificationSize: 10,
      mentorPage:       0,
      mentorSize:       10,
    },
  });
  return data;
};

//  Helpers 
const formatRevenue = (amount: number): string => {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)     return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
};

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const shortMonth = (month: string): string => month.slice(0, 3).toUpperCase();

const notifTypeToActivityType = (type: string): ActivityType => {
  const map: Record<string, ActivityType> = {
    SESSION:      'session',
    TASK:         'task',
    ANNOUNCEMENT: 'announcement',
    PAYMENT:      'payment',
    ALERT:        'alert',
  };
  return map[type?.toUpperCase()] ?? 'announcement';
};

const timeAgo = (dateStr: string): string => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Transform 
const transformDashboardData = (raw: AdminDashboardApiResponse) => {
  const { cards, sessionsChart, notifications, topMentors } = raw.apiResponse.dashboard;

  const stats: StatCardData[] = [
    { id: 'students',    label: 'Total Students',     value: formatCount(cards.totalStudents),     iconType: 'students'    },
    { id: 'mentors',     label: 'Total Mentors',      value: formatCount(cards.totalMentors),      iconType: 'mentors'     },
    { id: 'mentorships', label: 'Active Mentorships', value: formatCount(cards.activeMentorships), iconType: 'mentorships' },
    { id: 'revenue',     label: 'Total Revenue',      value: formatRevenue(cards.totalRevenue),    iconType: 'revenue'     },
  ];

  const chartData: ChartPoint[] = sessionsChart.map(p => ({
    month:    `${shortMonth(p.month)} ${p.year}`,
    sessions: p.totalSessions,
  }));

  const mentors: TopMentor[] = topMentors.content.map((m, i) => ({
    rank:            i + 1,
    name:            m.fullName,
    email:           m.email,
    students:        m.totalStudents,
    revenue:         formatRevenue(m.totalRevenue),
    profileImageUrl: m.profileImageUrl,
  }));

  const events: ActivityEvent[] = notifications.content.map(n => ({
    id:          n.id,
    type:        notifTypeToActivityType(n.type),
    title:       n.title,
    description: n.content,
    timeLabel:   timeAgo(n.createdAt),
    isAlert:     n.type?.toUpperCase() === 'ALERT',
  }));

  return { stats, chartData, mentors, events };
};


export const useAdminDashboard = (months = 0) => {
  return useQuery({
    queryKey:  [...ADMIN_DASHBOARD_KEY, { months }],
    queryFn:   () => fetchAdminDashboard(months),
    staleTime: 5  * 60 * 1000,   
    gcTime:    15 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: transformDashboardData,
  });
};