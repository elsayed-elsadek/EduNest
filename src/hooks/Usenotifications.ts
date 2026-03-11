
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { wsService } from '../services/Websocketservice';
import {
  getAllNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../services/Notificationservice';
import {
  toUiNotification,
  type Notification,
  type NotificationApiDto,
} from '../types/mentornotification.types';

export const useNotifications = () => {
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount  ] = useState(0);
  const [loading,       setLoading      ] = useState(false);
  const [error,         setError        ] = useState<string | null>(null);

  //  Reset mountedRef to true on every mount (fixes StrictMode double-invoke) 
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;           //  reset on each mount
    return () => { mountedRef.current = false; };
  }, []);

  const extractError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'Something went wrong';
    const e = err as Record<string, unknown>;
    if (e.errorMessages && typeof e.errorMessages === 'object') {
      const first = Object.values(e.errorMessages as Record<string, unknown>)[0];
      if (typeof first === 'string') return first;
    }
    return typeof e.message === 'string' ? e.message : 'Something went wrong';
  };

  //  Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAllNotifications(0, 50);
      const items = Array.isArray(res?.content) ? res.content : [];
      setNotifications(items.map(toUiNotification));
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  //  Fetch unread count 
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(Number(count) || 0);
    } catch { /* silent */ }
  }, [token]);

  // Mark single as read
  const handleMarkRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true, isNew: false } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: false, isNew: true } : n)
      );
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Mark all as read 
  const handleMarkAllRead = useCallback(async () => {
    const snapshot = notifications;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, isNew: false })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(snapshot);
      fetchUnreadCount();
    }
  }, [notifications, fetchUnreadCount]);

  //  Dismiss single 
  const handleDismiss = useCallback(async (id: string) => {
    const snapshot = notifications;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteNotification(id);
      fetchUnreadCount();
    } catch {
      setNotifications(snapshot);
    }
  }, [notifications, fetchUnreadCount]);

  // Delete all
  const handleDeleteAll = useCallback(async () => {
    const snapshot = notifications;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await deleteAllNotifications();
    } catch {
      setNotifications(snapshot);
      fetchUnreadCount();
    }
  }, [notifications, fetchUnreadCount]);

  // WebSocket: real-time push
  useEffect(() => {
    if (!token || !isHydrated) return;

    let subscribed = false;

    wsService.connect(token, () => {
      // Guard: don't subscribe if component unmounted between connect and callback
      if (!mountedRef.current) return;
      subscribed = true;

      wsService.subscribeToNotifications((data) => {
        if (!mountedRef.current) return;
        const dto = data as NotificationApiDto;
        setNotifications(prev => [toUiNotification(dto), ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    });

    return () => {
      if (subscribed) {
        wsService.unsubscribe('/user/queue/notifications');
      }
    };
  }, [token, isHydrated]);

  //  Initial load 
  useEffect(() => {
    if (isHydrated && token) {
      fetchNotifications();
      fetchUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    handleMarkRead,
    handleMarkAllRead,
    handleDismiss,
    handleDeleteAll,
    refetch: fetchNotifications,
  };
};