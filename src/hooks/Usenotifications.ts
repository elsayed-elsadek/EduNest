
import { useState, useEffect, useCallback } from 'react';
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

  const extractError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'Something went wrong';
    const e = err as Record<string, unknown>;
    if (e.errorMessages && typeof e.errorMessages === 'object') {
      const first = Object.values(e.errorMessages as Record<string, unknown>)[0];
      if (typeof first === 'string') return first;
    }
    return typeof e.message === 'string' ? e.message : 'Something went wrong';
  };

  // ── Fetch all notifications ────────────────────────────────────────────────
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

  // ── Fetch unread count ─────────────────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(Number(count) || 0);
    } catch { /* silent */ }
  }, [token]);

  // ── Mark single as read ───────────────────────────────────────────────────
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

  // ── Mark all as read ──────────────────────────────────────────────────────
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

  // ── Dismiss single ────────────────────────────────────────────────────────
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

  // ── Delete all ────────────────────────────────────────────────────────────
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

  // ── WebSocket: subscribe only ──────────────────────────────────────────────
  // ✅ الـ connect بيتعمل مرة واحدة بس في WebSocketProvider
  // الـ hook ده بس بيعمل subscribe على الـ notifications topic
  useEffect(() => {
    if (!token || !isHydrated) return;

    let isMounted = true;

    const handleNotification = (data: unknown) => {
      if (!isMounted) return;
      const dto = data as NotificationApiDto;
      const notification = toUiNotification(dto);
      setNotifications(prev => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    };

    if (wsService.isConnected) {
      // ✅ الـ connection جاهزة — subscribe على طول
      wsService.subscribeToNotifications(handleNotification);
    } else {
      // ✅ الـ connection لسه شغالة — حط الـ subscribe في queue
      wsService.connect(token, () => {
        if (!isMounted) return;
        wsService.subscribeToNotifications(handleNotification);
      });
    }

    return () => {
      isMounted = false;
      wsService.unsubscribe('/user/queue/notifications', handleNotification);
    };
  }, [token, isHydrated]);

  // ── Initial data load ─────────────────────────────────────────────────────
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