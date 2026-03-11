
import { formatTimeAgo } from '../utils/formatTimeago';
export type NotificationApiType = 'TASK' | 'SESSION' | 'QUIZ' | 'ANNOUNCEMENT';

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
export type NotificationType = 'session' | 'assignment' | 'message' | 'general';

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
  TASK:         'assignment',
  SESSION:      'session',
  QUIZ:         'assignment',
  ANNOUNCEMENT: 'general',
};

export const toUiNotification = (dto: NotificationApiDto): Notification => ({
  id:        String(dto.id),
  type:      TYPE_MAP[dto.type] ?? 'general',
  title:     dto.title,
  message:   dto.content,
  isRead:    dto.read,          // ← map read → isRead
  isNew:     !dto.read,
timestamp: formatTimeAgo(dto.time),
});