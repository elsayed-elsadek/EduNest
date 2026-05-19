import api from '../api';
import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  AdminDashboardApiResponse,
  StatCardData,
  ChartPoint,
  TopMentor,
  ActivityEvent,
  ActivityType,
  AdminUsersDashboardSummaryResponse,
} from '../../types/admin-role-types/admin-dash.types';

// يمكنك إضافة التايبس هنا أو في ملف التايبس الخاص بك للـ User Details
export interface UserDetailsResponse {
  apiResponse: {
    message: string;
    mentorDetails?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      profileImageUrl: string | null;
      enabled: boolean;
      bio: string;
      jobTitle: string;
      yearsOfExperience: number;
      totalSessions: number;
      totalStudents: number;
      averageRating: number;
      totalBadges: number;
      mentorshipCount: number;
      socialMedia: Array<{ name: string; url: string }>;
      adminBadges: unknown[];
    };
    studentDetails?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      profileImageUrl: string | null;
      enabled: boolean;
      educationalLevel: string;
      bio: string;
      jobTitle: string;
      totalEnrollments: number;
      totalCompletedMentorships: number;
      totalBadgesEarned: number;
      socialMedia: Array<{ name: string; url: string }>;
      adminBadges: any[];
    };
  };
}

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

export const ADMIN_USERS_DASHBOARD_KEY = ['admin', 'users', 'dashboard-summary'] as const;

const fetchAdminUsersDashboard = async (months: number, page: number, size: number): Promise<AdminUsersDashboardSummaryResponse> => {
  const { data } = await api.get<AdminUsersDashboardSummaryResponse>('api/v1/admin/users/dashboard-summary', {
    params: { months, page, size },
  });
  return data;
};

export const useAdminUsersDashboard = (months = 6, page = 0, size = 10) => {
  return useQuery({
    queryKey: [...ADMIN_USERS_DASHBOARD_KEY, { months, page, size }],
    queryFn: () => fetchAdminUsersDashboard(months, page, size),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// الـ API الجديد لجلب تفاصيل الـ User بالـ ID كاملة
export const ADMIN_USER_DETAILS_KEY = ['admin', 'users', 'details'] as const;

const fetchAdminUserDetails = async (id: number): Promise<UserDetailsResponse> => {
  const { data } = await api.get<UserDetailsResponse>(`api/v1/admin/users/${id}`);
  return data;
};

export const useAdminUserDetails = (id: number | null) => {
  return useQuery({
    queryKey: [...ADMIN_USER_DETAILS_KEY, id],
    queryFn: () => fetchAdminUserDetails(id!),
    enabled: !!id, // يشتغل فقط لو الـ id موجود ومش null
    staleTime: 2 * 60 * 1000,
  });
};

// 1. تعريف الـ Interface الخاص بالبيانات المطلوبة للـ Request Body
export interface SendNotificationPayload {
  userId: number;
  title: string;
  content: string;
}

// 2. دالة الـ API لإرسال الإشعار (POST Request)
const sendAdminNotification = async (payload: SendNotificationPayload) => {
  const { data } = await api.post('api/v1/admin/users/send-notification', payload);
  return data;
};

// 3. Custom Hook لاستخدامه داخل الـ Component بكل سهولة مع إدارة الـ Loading والـ Success
export const useAdminSendNotification = () => {
  return useMutation({
    mutationFn: sendAdminNotification,
  });
};

// 4. تعريف الـ Interface الخاص بالبيانات المطلوبة لإرسال بريد إلكتروني
export interface SendEmailPayload {
  userId: number;
  subject: string;
  message: string;
}

// 5. دالة الـ API لإرسال البريد الإلكتروني (POST Request)
const sendAdminEmail = async (payload: SendEmailPayload) => {
  const { data } = await api.post('api/v1/admin/users/send-email', payload);
  return data;
};

// 6. Custom Hook لإرسال البريد الإلكتروني مع إدارة الـ Loading والـ Success
export const useAdminSendEmail = () => {
  return useMutation({
    mutationFn: sendAdminEmail,
  });
};

// 7. تعريف الـ Interface الخاص ببيانات إسناد الشارة (Assign Badge)
export interface AssignBadgePayload {
  userId: number;
  badgeId: number;
  recognitionNote: string;
}

// 8. دالة الـ API لإسناد الشارة (POST Request)
const assignAdminBadge = async (payload: AssignBadgePayload) => {
  const { data } = await api.post('api/admin/badges/assign', payload);
  return data;
};

// 9. Custom Hook لإسناد الشارة
export const useAdminAssignBadge = () => {
  return useMutation({
    mutationFn: assignAdminBadge,
  });
};

// 10. دالة الـ API لحذف الشارة (DELETE Request)
const removeAdminBadge = async (userBadgeId: number) => {
  const { data } = await api.delete(`api/admin/badges/${userBadgeId}`);
  return data;
};

// 11. Custom Hook لحذف الشارة
export const useAdminRemoveBadge = () => {
  return useMutation({
    mutationFn: removeAdminBadge,
  });
};


// 12. تعريف الـ Interfaces والـ Query Hook لجلب شارات المستخدم المحدد
export interface AdminUserBadge {
  id: number;
  userId: number;
  userFullName: string;
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  badgeType: string;
  recognitionNote: string;
  awardedAt: string;
}

export interface UserBadgesResponse {
  apiResponse: {
    badges: AdminUserBadge[];
    message: string;
  };
}

const fetchUserBadges = async (userId: number): Promise<UserBadgesResponse> => {
  const { data } = await api.get<UserBadgesResponse>(`api/users/${userId}/badges`);
  return data;
};

export const useAdminUserBadges = (userId: number | null) => {
  return useQuery({
    queryKey: ['admin', 'users', 'badges', userId],
    queryFn: () => fetchUserBadges(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
};


