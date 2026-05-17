import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { wsService } from '../services/Websocketservice';
import { getAllConversations } from '../services/Directchatservice';
import type { ConversationDto } from '../types/mentor-meaasges.types';

const sumUnreadCount = (conversations: ConversationDto[] | undefined): number =>
  (conversations ?? []).reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0);

export const useDirectChatUnreadCount = () => {
  const token      = useAuthStore((s) => s.token);
  const userEmail  = useAuthStore((s) => s.userEmail);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await getAllConversations();
      const data = res as { apiResponse?: { conversations?: ConversationDto[] } };
      setUnreadCount(sumUnreadCount(data.apiResponse?.conversations));
    } catch {
      // ignore failures silently
    }
  }, [token]);

  useEffect(() => {
    if (!token || !isHydrated) return;
    fetchUnreadCount();
  }, [fetchUnreadCount, isHydrated, token]);

  useEffect(() => {
    if (!token || !isHydrated) return;

    const normalizedSelf = (userEmail ?? '').toLowerCase().trim();
    const handleIncoming = (payload: unknown) => {
      const event = payload as { type?: string; senderEmail?: string; id?: number };
      if (event.type === 'DELETE') return;
      if (event.senderEmail?.toLowerCase().trim() === normalizedSelf) return;
      if (event.id) setUnreadCount(prev => prev + 1);
    };

    wsService.connect(token);
    wsService.subscribeToPrivateMessages(handleIncoming);

    return () => {
      wsService.unsubscribe('/user/queue/messages', handleIncoming);
    };
  }, [token, isHydrated, userEmail]);

  return { unreadCount, refetchUnreadCount: fetchUnreadCount };
};
