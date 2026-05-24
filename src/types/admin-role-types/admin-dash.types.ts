
import type { NotificationType } from '../mentornotification.types';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface AdminDashboardApiResponse {
  apiResponse: {
    message: string;
    dashboard: {
      cards: {
        totalStudents: number;
        totalMentors: number;
        activeMentorships: number;
        completedMentorships: number;
        totalRevenue: number;
      };
      sessionsChart: {
        month: string;
        year: number;
        totalSessions: number;
      }[];
      notifications: {
        content: {
          id: number;
          title: string;
          content: string;
          type: string;
          createdAt: string;
        }[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      };
      topMentors: {
        content: {
          fullName: string;
          email: string;
          profileImageUrl: string | null;
          totalStudents: number;
          totalRevenue: number;
        }[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      };
    };
  };
}

export interface UserSummaryData {
  id: number;
  enabled: boolean;
  roleName: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

export interface MonthlyUserStat {
  month: string;
  year: number;
  totalUsers: number;
}

export interface AdminUsersDashboardSummaryResponse {
  apiResponse: {
    dashboardSummary: {
      monthlyUsers: MonthlyUserStat[];
      allUsersPaginated: {
        content: UserSummaryData[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      };
    };
    message: string;
  };
}

// ────────────────────────────────── UI Types ──────────────────────────────────

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  iconType: 'students' | 'mentors' | 'mentorships' | 'revenue';
}

export interface ChartPoint {
  month: string;
  sessions: number;
}

export interface TopMentor {
  rank: number;
  name: string;
  email: string;
  students: number;
  revenue: string;
  profileImageUrl: string | null;
}

/**
 * 🎯 Unified activity type — mirrors NotificationType + admin-specific types
 * PAYMENT and other admin actions map to "other" if not in NotificationType
 */
export type ActivityType = NotificationType | 'verified' | 'alert' | 'payment' | 'other';

export interface ActivityEvent {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  linkText?: string;
  timeLabel: string;
  isAlert: boolean;
}

// ─────────────────────────── Component Props ──────────────────────────────

export interface DashboardHeaderProps {
  onExport: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export interface StatsGridProps {
  stats: StatCardData[];
}

export interface StatCardProps {
  data: StatCardData;
}

export interface EngagementChartProps {
  data: ChartPoint[];
  selectedRange: string;
  onRangeChange: (r: string) => void;
}

export interface TopMentorsProps {
  mentors:    TopMentor[];
  onViewAll?: () => void;
}

export interface MentorRowProps {
  mentor: TopMentor;
}

export interface LiveActivityStreamProps {
  events:     ActivityEvent[];
  onViewAll?: () => void;
}

export interface ActivityItemProps {
  event: ActivityEvent;
}