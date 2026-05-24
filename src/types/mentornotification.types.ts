
import { formatTimeAgo } from '../utils/formatTimeago';

export type NotificationType =
  | 'announcement'
  | 'quiz'
  | 'session'
  | 'task'
  | 'project'
  | 'support'
  | 'badge'
  | 'certificate'
  | 'live_session'
  | 'mentorship'
  | 'review';

export const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  ANNOUNCEMENT: 'announcement',
  QUIZ: 'quiz',
  SESSION: 'session',
  TASK: 'task',
  PROJECT: 'project',
  SUPPORT: 'support',
  BADGE: 'badge',
  CERTIFICATE: 'certificate',
  LIVE_SESSION: 'live_session',
  MENTORSHIP: 'mentorship',
  REVIEW: 'review',
} as const;


export type NotificationApiType =
  | 'ANNOUNCEMENT'
  | 'QUIZ'
  | 'SESSION'
  | 'TASK'
  | 'PROJECT'
  | 'SUPPORT'
  | 'BADGE'
  | 'CERTIFICATE'
  | 'LIVE_SESSION'
  | 'MENTORSHIP'
  | 'REVIEW';

export interface NotificationApiDto {
  id: number;
  title: string;
  content: string;
  type: NotificationApiType | string;
  read: boolean;
  time: string;
}

// Paginated wrapper — all list endpoints return this
export interface PaginatedNotifications {
  content: NotificationApiDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  isNew: boolean;
  timestamp: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

const TYPE_MAP: Record<NotificationApiType | string, NotificationType> = {
  ANNOUNCEMENT: NOTIFICATION_TYPES.ANNOUNCEMENT,
  QUIZ: NOTIFICATION_TYPES.QUIZ,
  SESSION: NOTIFICATION_TYPES.SESSION,
  TASK: NOTIFICATION_TYPES.TASK,
  PROJECT: NOTIFICATION_TYPES.PROJECT,
  SUPPORT: NOTIFICATION_TYPES.SUPPORT,
  BADGE: NOTIFICATION_TYPES.BADGE,
  CERTIFICATE: NOTIFICATION_TYPES.CERTIFICATE,
  LIVE_SESSION: NOTIFICATION_TYPES.LIVE_SESSION,
  MENTORSHIP: NOTIFICATION_TYPES.MENTORSHIP,
  REVIEW: NOTIFICATION_TYPES.REVIEW,
};

export const toUiNotification = (dto: NotificationApiDto): Notification => ({
  id: String(dto.id),
  type: TYPE_MAP[dto.type] ?? NOTIFICATION_TYPES.ANNOUNCEMENT,
  title: dto.title,
  message: dto.content,
  isRead: dto.read,
  isNew: !dto.read,
  timestamp: formatTimeAgo(dto.time),
});