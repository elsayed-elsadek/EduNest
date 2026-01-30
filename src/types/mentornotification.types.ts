
export type NotificationType = 'session' | 'assignment' | 'message' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  isNew: boolean;
  timestamp: string;
  icon?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}