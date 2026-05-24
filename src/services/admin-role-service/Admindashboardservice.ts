

import api from '../api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { NOTIFICATION_TYPES } from '../../types/mentornotification.types';
import { formatTimeAgo } from '../../utils/formatTimeago';
import type {
  AdminDashboardApiResponse,
  StatCardData,
  ChartPoint,
  TopMentor,
  ActivityEvent,
  ActivityType,
  AdminUsersDashboardSummaryResponse,
} from '../../types/admin-role-types/admin-dash.types';

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
      adminBadges: unknown[];
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
      mentorPage: 0,
      mentorSize: 10,
    },
  });
  return data;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatRevenue = (amount: number): string => {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
};

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const shortMonth = (month: string): string => month.slice(0, 3).toUpperCase();

const notifTypeToActivityType = (type: string): ActivityType => {
  const upperType = type?.toUpperCase() ?? '';

  const map: Record<string, ActivityType> = {
    ANNOUNCEMENT: NOTIFICATION_TYPES.ANNOUNCEMENT,
    QUIZ:         NOTIFICATION_TYPES.QUIZ,
    SESSION:      NOTIFICATION_TYPES.SESSION,
    TASK:         NOTIFICATION_TYPES.TASK,
    PROJECT:      NOTIFICATION_TYPES.PROJECT,
    SUPPORT:      NOTIFICATION_TYPES.SUPPORT,
    BADGE:        NOTIFICATION_TYPES.BADGE,
    CERTIFICATE:  NOTIFICATION_TYPES.CERTIFICATE,
    LIVE_SESSION: NOTIFICATION_TYPES.LIVE_SESSION,
    MENTORSHIP:   NOTIFICATION_TYPES.MENTORSHIP,
    REVIEW:       NOTIFICATION_TYPES.REVIEW,
    VERIFIED:     'verified',
    ALERT:        'alert',
    PAYMENT:      'payment',
  };

  return map[upperType] ?? 'other';
};

const timeAgo = (dateStr: string): string => formatTimeAgo(dateStr);

// ── Transform ─────────────────────────────────────────────────────────────────
const transformDashboardData = (raw: AdminDashboardApiResponse) => {
  const { cards, sessionsChart, notifications, topMentors } = raw.apiResponse.dashboard;

  const stats: StatCardData[] = [
    { id: 'students', label: 'Total Students', value: formatCount(cards.totalStudents), iconType: 'students' },
    { id: 'mentors', label: 'Total Mentors', value: formatCount(cards.totalMentors), iconType: 'mentors' },
    { id: 'mentorships', label: 'Active Mentorships', value: formatCount(cards.activeMentorships), iconType: 'mentorships' },
    { id: 'revenue', label: 'Total Revenue', value: formatRevenue(cards.totalRevenue), iconType: 'revenue' },
  ];

  const chartData: ChartPoint[] = sessionsChart.map(p => ({
    month: `${shortMonth(p.month)} ${p.year}`,
    sessions: p.totalSessions,
  }));

  const mentors: TopMentor[] = topMentors.content.map((m, i) => ({
    rank: i + 1,
    name: m.fullName,
    email: m.email,
    students: m.totalStudents,
    revenue: formatRevenue(m.totalRevenue),
    profileImageUrl: m.profileImageUrl,
  }));

  const events: ActivityEvent[] = notifications.content.map(n => ({
    id: n.id,
    type: notifTypeToActivityType(n.type),
    title: n.title,
    description: n.content,
    timeLabel: timeAgo(n.createdAt),
    isAlert: n.type?.toUpperCase() === 'ALERT',
  }));

  return { stats, chartData, mentors, events };
};

export const useAdminDashboard = (months = 0) => {
  return useQuery({
    queryKey: [...ADMIN_DASHBOARD_KEY, { months }],
    queryFn: () => fetchAdminDashboard(months),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: transformDashboardData,
  });
};

// ── Users Dashboard ───────────────────────────────────────────────────────────
export const ADMIN_USERS_DASHBOARD_KEY = ['admin', 'users', 'dashboard-summary'] as const;

const fetchAdminUsersDashboard = async (
  months: number,
  page: number,
  size: number,
): Promise<AdminUsersDashboardSummaryResponse> => {
  const { data } = await api.get<AdminUsersDashboardSummaryResponse>(
    'api/v1/admin/users/dashboard-summary',
    { params: { months, page, size } },
  );
  return data;
};

export const useAdminUsersDashboard = (months = 6, page = 0, size = 10) => {
  return useQuery({
    queryKey: [...ADMIN_USERS_DASHBOARD_KEY, { months, page, size }],
    queryFn:  () => fetchAdminUsersDashboard(months, page, size),
    staleTime: 5  * 60 * 1000,
    gcTime:    15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ── User Details ──────────────────────────────────────────────────────────────
export const ADMIN_USER_DETAILS_KEY = ['admin', 'users', 'details'] as const;

const fetchAdminUserDetails = async (id: number): Promise<UserDetailsResponse> => {
  const { data } = await api.get<UserDetailsResponse>(`api/v1/admin/users/${id}`);
  return data;
};

export const useAdminUserDetails = (id: number | null) => {
  return useQuery({
    queryKey: [...ADMIN_USER_DETAILS_KEY, id],
    queryFn:  () => fetchAdminUserDetails(id!),
    enabled:  !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// ── Send Notification ─────────────────────────────────────────────────────────
export interface SendNotificationPayload {
  userId: number;
  title: string;
  content: string;
}

const sendAdminNotification = async (payload: SendNotificationPayload) => {
  const { data } = await api.post('api/v1/admin/users/send-notification', payload);
  return data;
};

export const useAdminSendNotification = () => {
  return useMutation({ mutationFn: sendAdminNotification });
};

// ── Send Email ────────────────────────────────────────────────────────────────
export interface SendEmailPayload {
  userId: number;
  subject: string;
  message: string;
}

const sendAdminEmail = async (payload: SendEmailPayload) => {
  const { data } = await api.post('api/v1/admin/users/send-email', payload);
  return data;
};

export const useAdminSendEmail = () => {
  return useMutation({ mutationFn: sendAdminEmail });
};

// ── Assign Badge ──────────────────────────────────────────────────────────────
export interface AssignBadgePayload {
  userId: number;
  badgeId: number;
  recognitionNote: string;
}

const assignAdminBadge = async (payload: AssignBadgePayload) => {
  const { data } = await api.post('api/admin/badges/assign', payload);
  return data;
};

export const useAdminAssignBadge = () => {
  return useMutation({ mutationFn: assignAdminBadge });
};

// ── Remove Badge ──────────────────────────────────────────────────────────────
const removeAdminBadge = async (userBadgeId: number) => {
  const { data } = await api.delete(`api/admin/badges/${userBadgeId}`);
  return data;
};

export const useAdminRemoveBadge = () => {
  return useMutation({ mutationFn: removeAdminBadge });
};

// ── User Badges ───────────────────────────────────────────────────────────────
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
    queryFn:  () => fetchUserBadges(userId!),
    enabled:  !!userId,
    staleTime: 1 * 60 * 1000,
  });
};

export interface CreateBadgePayload {
  name: string;
  description: string;
  type: 'ACADEMIC_EXCELLENCE' | 'TOP_MENTOR' | 'COMMUNITY_LEADER' | 'INNOVATOR_AWARD';
}

export interface CreateBadgeResponse {
  apiResponse: {
    badge: {
      id: number;
      name: string;
      description: string;
      type: string;
    };
    message: string;
  };
}

const createAdminBadge = async (payload: CreateBadgePayload): Promise<CreateBadgeResponse> => {
  const { data } = await api.post<CreateBadgeResponse>('api/admin/badges', payload);
  return data;
};

export const useAdminCreateBadge = () => {
  return useMutation({
    mutationFn: createAdminBadge,
  });
};

export interface AdminBadge {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface GetAllBadgesResponse {
  apiResponse: {
    badges: AdminBadge[];
    message: string;
  };
}

const fetchAllAdminBadges = async (): Promise<GetAllBadgesResponse> => {
  const { data } = await api.get<GetAllBadgesResponse>('api/admin/badges');
  return data;
};

export const useAdminAllBadges = () => {
  return useQuery({
    queryKey: ['admin', 'badges', 'all'] as const,
    queryFn: fetchAllAdminBadges,
    staleTime: 5 * 60 * 1000,
  });
};

const deleteAdminBadge = async (badgeId: number): Promise<void> => {
  await api.delete(`api/admin/badges/delete/${badgeId}`);
};

export const useAdminDeleteBadge = () => {
  return useMutation({
    mutationFn: deleteAdminBadge,
  });
};

// ── 🆕 Delete Single Notification ────────────────────────────────────────────
// DELETE /api/v1/admin/notifications/{id}
const deleteAdminNotification = async (id: number) => {
  const { data } = await api.delete(`api/v1/admin/notifications/${id}`);
  return data;
};

export const useAdminDeleteNotification = () => {
  return useMutation({ mutationFn: deleteAdminNotification });
};

// ── 🆕 Delete ALL Notifications ───────────────────────────────────────────────
// DELETE /api/v1/admin/notifications/delete-all
const deleteAllAdminNotifications = async () => {
  const { data } = await api.delete('api/v1/admin/notifications/delete-all');
  return data;
};

export const useAdminDeleteAllNotifications = () => {
  return useMutation({ mutationFn: deleteAllAdminNotifications });
};