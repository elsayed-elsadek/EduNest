import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { wsService } from '../services/Websocketservice';
import { getAllConversations } from '../services/Directchatservice';
import type {
  ConversationDto, ConversationRealtimeEvent,
} from '../types/mentor-meaasges.types';

const sumUnreadCount = (conversations: ConversationDto[] | undefined): number =>
  (conversations ?? []).reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0);

/** Message/conversation ids are opaque UUID strings from the documented event contract. */
const asOpaqueId = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

export const useDirectChatUnreadCount = () => {
  const token      = useAuthStore((s) => s.token);
  const userEmail  = useAuthStore((s) => s.userEmail);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenMessageIdsRef.current.clear();
  }, [token, userEmail]);

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
      const event = payload as ConversationRealtimeEvent;
      if (event.type === 'DELETE') return;

      const messageId = asOpaqueId(event.id);
      const conversationId = asOpaqueId(event.conversationId);
      // Only a UUID-identified message in a UUID-identified conversation can be
      // safely counted once. CREATE/EDIT broadcasts share the same shape.
      if (!messageId || !conversationId) return;
      if (event.senderEmail != null && event.senderEmail.toLowerCase().trim() === normalizedSelf) return;

      const seen = seenMessageIdsRef.current;
      if (seen.has(messageId)) return;
      seen.add(messageId);
      setUnreadCount(prev => prev + 1);
    };

    wsService.connect(token);
    wsService.subscribeToPrivateMessages(handleIncoming);

    return () => {
      wsService.unsubscribe('/user/queue/messages', handleIncoming);
    };
  }, [token, isHydrated, userEmail]);

  return { unreadCount, refetchUnreadCount: fetchUnreadCount };
};
