
export interface MentorNavbarProps {
  pageTitle?: string;
  userName: string;
  userRole?: string;
  userAvatar?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}