
import { formatTimeAgo } from '../utils/formatTimeago';
export type NotificationApiType =
  | 'ANNOUNCEMENT'
  | 'QUIZ'
  | 'SESSION'
  | 'TASK'
  | 'PROJECT'
  | 'SUPPORT'
  | 'BADGE'
  | 'CERTIFICATE'
  | 'LIVE_SESSION';

export interface NotificationApiDto {
  id:      number;
  title:   string;
  content: string;
  type:    NotificationApiType;
  read:    boolean;         
  time:    string;
}

// Paginated wrapper — all list endpoints return this
export interface PaginatedNotifications {
  content:       NotificationApiDto[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
}

//  UI shape (used in components) 
export type NotificationType =
  | 'announcement'
  | 'quiz'
  | 'session'
  | 'task'
  | 'project'
  | 'support'
  | 'badge'
  | 'certificate'
  | 'live_session';

export interface Notification {
  id:           string;
  type:         NotificationType;
  title:        string;
  message:      string;
  isRead:       boolean;
  isNew:        boolean;
  timestamp:    string;
  actionLabel?: string;
  actionUrl?:   string;
}

export interface NotificationStats {
  total:  number;
  unread: number;
}


const TYPE_MAP: Record<NotificationApiType, NotificationType> = {
  ANNOUNCEMENT: 'announcement',
  QUIZ:         'quiz',
  SESSION:      'session',
  TASK:         'task',
  PROJECT:      'project',
  SUPPORT:      'support',
  BADGE:        'badge',
  CERTIFICATE:  'certificate',
  LIVE_SESSION: 'live_session',
};

export const toUiNotification = (dto: NotificationApiDto): Notification => ({
  id:        String(dto.id),
  type:      TYPE_MAP[dto.type] ?? 'announcement',
  title:     dto.title,
  message:   dto.content,
  isRead:    dto.read,
  isNew:     !dto.read,
timestamp: formatTimeAgo(dto.time),
});