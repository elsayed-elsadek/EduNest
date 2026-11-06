import { useEffect } from 'react';
import { wsService } from '../../../../services/Websocketservice';
import type { NotificationApiDto, Notification } from '../../../../types/mentornotification.types';
import { toUiNotification } from '../../../../types/mentornotification.types';
import type { PaginationMeta } from './helpers';
import logger from '../../../../utils/logger';

type SetNotifications = (updater: (prev: Notification[]) => Notification[]) => void;
type SetNotificationPagination = (updater: (prev: PaginationMeta) => PaginationMeta) => void;

export function useNotificationsSocket(
  token: string | undefined,
  isHydrated: boolean,
  setNotifications: SetNotifications,
  setNotificationPagination: SetNotificationPagination,
) {
  useEffect(() => {
    if (!token || !isHydrated) return;

    let isMounted = true;

    const handleNewNotification = (data: unknown) => {
      if (!isMounted) return;
      try {
        const dto = data as NotificationApiDto;
        const notification = toUiNotification(dto);

        setNotifications((prev) => [notification, ...prev]);

        if (!notification.isRead) {
          setNotificationPagination((prev) => ({
            ...prev,
            totalElements: (prev.totalElements || 0) + 1,
          }));
        }
      } catch (err) {
        logger.error('Failed to process notification:', err);
      }
    };

    if (wsService.isConnected) {
      wsService.subscribeToNotifications(handleNewNotification);
    } else {
      wsService.connect(token, () => {
        if (!isMounted) return;
        wsService.subscribeToNotifications(handleNewNotification);
      });
    }

    return () => {
      isMounted = false;
      wsService.unsubscribe('/user/queue/notifications', handleNewNotification);
    };
  }, [token, isHydrated, setNotifications, setNotificationPagination]);
}
