
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { getAssetUrl } from '../config/env';
import { wsService } from '../services/Websocketservice';
import {
  getAllConversations,
  getConversationMessages,
  editMessage,
  deleteMessage,
} from '../services/Directchatservice';
import { parseApiError } from '../services/errors';
import type {
  Chat, Message,
  ConversationDto, ConversationMessageDto, ConversationRealtimeEvent,
} from '../types/mentor-meaasges.types';

const fullUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  if (/^(https?:\/\/|data:)/i.test(path)) return path;
  return getAssetUrl(path);
};

const toUtcTs = (ts: string | undefined): string => {
  if (!ts) return '';
  if (ts.endsWith('Z') || ts.includes('+')) return ts;
  return ts + 'Z';
};

/** 403 and 404 are deliberately collapsed into one non-identifying state. */
const isUnavailableConversationError = (error: unknown): boolean => {
  const attached = (error as { normalized?: { status?: number; errorCode?: string } } | null)?.normalized;
  const normalized = attached ?? parseApiError(error);

  return (
    normalized.status === 403 ||
    normalized.status === 404 ||
    normalized.errorCode === 'ERR_FORBIDDEN' ||
    normalized.errorCode === 'ERR_RESOURCE_NOT_FOUND'
  );
};

const toChat = (dto: ConversationDto): Chat => ({
  id:             `direct-${dto.conversationId}`,
  mode:           'direct',
  userId:         dto.otherUserEmail,
  userName:       dto.otherUserName,
  userAvatar:     fullUrl(dto.otherUserProfileImageUrl ?? undefined),
  lastMessage:    dto.lastMessage  ?? '',
  timestamp:      toUtcTs(dto.lastMessageTime),
  unreadCount:    dto.unreadCount  ?? 0,
  conversationId: dto.conversationId,
});

const toMessage = (dto: ConversationMessageDto): Message => ({
  id:           String(dto.id),
  chatId:       String(dto.conversationId),
  senderId:     dto.senderEmail.toLowerCase().trim(),   // ← normalize
  senderName:   dto.senderName,
  senderAvatar: fullUrl(dto.senderProfileImageUrl ?? undefined),
  content:      dto.content,
  timestamp:    toUtcTs(dto.sentAt),
  isRead:       true,
});

const sortByRecent = (chats: Chat[]): Chat[] =>
  [...chats].sort((a, b) => {
    if (!a.timestamp && !b.timestamp) return 0;
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

export const useDirectChat = () => {
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const userEmail  = useAuthStore((s) => s.userEmail);

  const [chats,      setChats     ] = useState<Chat[]>([]);
  const [messages,   setMessages  ] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading,    setLoading   ] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const mountedRef    = useRef(true);
  const activeChatRef = useRef<Chat | null>(null);
  const messagesRef   = useRef<Message[]>([]);
  const fetchConvsRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // ← normalized myEmail used everywhere
  const myEmail = (userEmail ?? '').toLowerCase().trim();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const markUnavailable = useCallback(() => {
    if (!mountedRef.current) return;
    setUnavailable(true);
    setActiveChat(null);
    activeChatRef.current = null;
    setMessages([]);
    messagesRef.current = [];
    setMsgLoading(false);
  }, []);

  const clearUnavailable = useCallback(() => {
    if (!mountedRef.current) return;
    setUnavailable(false);
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await getAllConversations();
      const data = res as { apiResponse?: { conversations?: ConversationDto[] } };
      const list = data.apiResponse?.conversations ?? [];
      // Filter out self-conversations
      const filtered = list.filter((c: ConversationDto) =>
        c.otherUserEmail.toLowerCase().trim() !== myEmail
      );
      if (mountedRef.current) setChats(sortByRecent(filtered.map(toChat)));
    } catch { /* silent */ }
    finally { if (mountedRef.current) setLoading(false); }
  }, [token, myEmail]);

  useEffect(() => { fetchConvsRef.current = fetchConversations; }, [fetchConversations]);

  const openConversation = useCallback(async (chat: Chat) => {
    if (!chat.conversationId) {
      // No real conversation to open: never fabricate one from an email.
      markUnavailable();
      return;
    }

    // A new navigation attempt clears a previous unavailable state. It is
    // cleared again on success so a failed 500 is not reported as unavailable.
    setUnavailable(false);
    // ── Optimistically clear the unread badge immediately ──
    setChats(prev =>
      prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c)
    );
    setActiveChat(chat);
    activeChatRef.current = chat;
    setMsgLoading(true);
    setMessages([]);
    messagesRef.current = [];
    try {
      const res  = await getConversationMessages(chat.conversationId);
      const data = res as { apiResponse?: { messages?: ConversationMessageDto[] } };
      const list = data.apiResponse?.messages ?? [];
      if (mountedRef.current) {
        const loaded = [...list].reverse().map(toMessage);
        setMessages(loaded);
        messagesRef.current = loaded;
        setUnavailable(false);
      }
    } catch (error) {
      if (isUnavailableConversationError(error) && mountedRef.current) {
        setUnavailable(true);
        setActiveChat(null);
        activeChatRef.current = null;
        setMessages([]);
        messagesRef.current = [];
      }
      // All other errors keep the existing silent behavior.
    } finally { if (mountedRef.current) setMsgLoading(false); }
  }, [markUnavailable]);

  const sendMessage = useCallback((recipientEmail: string, content: string) => {
    wsService.sendPrivateMessage(recipientEmail, content);
  }, []);

  const handleEditMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    const previous = messagesRef.current.find(m => m.id === messageId);
    setMessages(prev => {
      const next = prev.map(m => m.id === messageId ? { ...m, content, edited: true } : m);
      messagesRef.current = next;
      return next;
    });
    try {
      await editMessage(messageId, content);
    } catch {
      // Roll back the optimistic edit without surfacing backend details.
      setMessages(prev => {
        const next = previous
          ? prev.map(m => m.id === messageId ? previous : m)
          : prev.filter(m => m.id !== messageId);
        messagesRef.current = next;
        return next;
      });
    } finally {
      fetchConvsRef.current();
    }
  }, []);

  const handleDeleteMessage = useCallback(async (messageId: string): Promise<void> => {
    const previousMessages = messagesRef.current;
    const previousIndex = previousMessages.findIndex(m => m.id === messageId);
    const previous = previousMessages[previousIndex];
    setMessages(prev => {
      const next = prev.filter(m => m.id !== messageId);
      messagesRef.current = next;
      return next;
    });
    try {
      await deleteMessage(messageId);
    } catch {
      // Put the original message back at its original position on failure.
      setMessages(prev => {
        if (prev.some(m => m.id === messageId)) return prev;
        const next = [...prev];
        if (previous) next.splice(Math.min(previousIndex, next.length), 0, previous);
        messagesRef.current = next;
        return next;
      });
    } finally {
      fetchConvsRef.current();
    }
  }, []);

  useEffect(() => {
    if (!token || !isHydrated) return;

    wsService.connect(token, () => {
      if (!mountedRef.current) return;

      wsService.subscribeToPrivateMessages((data) => {
        if (!mountedRef.current) return;
        const event = data as ConversationRealtimeEvent;

        if (event.type === 'DELETE' && event.messageId) {
          setMessages(prev => prev.filter(m => m.id !== String(event.messageId)));
          fetchConvsRef.current();
          return;
        }

        if (event.id) {
          setMessages(prev => {
            const existing = prev.find(m => m.id === String(event.id));
            if (existing) {
              const nextContent = event.content ?? existing.content;
              if (nextContent === existing.content) return prev;
              return prev.map(m =>
                m.id === String(event.id)
                  ? { ...m, content: nextContent, edited: true }
                  : m
              );
            }
            return [...prev, {
              id:           String(event.id),
              chatId:       String(event.conversationId ?? ''),
              senderId:     (event.senderEmail ?? '').toLowerCase().trim(),  // ← normalize
              senderName:   event.senderName  ?? '',
              senderAvatar: fullUrl(event.senderProfileImageUrl ?? undefined),
              content:      event.content ?? '',
              timestamp:    toUtcTs(event.sentAt ?? new Date().toISOString()),
              isRead:       false,
            }];
          });
          fetchConvsRef.current();
        }
      });
    });

    const handlePrivateMessage = (data: unknown) => {
      if (!mountedRef.current) return;
      const event = data as ConversationRealtimeEvent;

      if (event.type === 'DELETE' && event.messageId) {
        setMessages(prev => prev.filter(m => m.id !== String(event.messageId)));
        fetchConvsRef.current();
        return;
      }

      if (event.id) {
        setMessages(prev => {
          const existing = prev.find(m => m.id === String(event.id));
          if (existing) {
            const nextContent = event.content ?? existing.content;
            if (nextContent === existing.content) return prev;
            return prev.map(m =>
              m.id === String(event.id)
                ? { ...m, content: nextContent, edited: true }
                : m
            );
          }
          return [...prev, {
            id:           String(event.id),
            chatId:       String(event.conversationId ?? ''),
            senderId:     (event.senderEmail ?? '').toLowerCase().trim(),
            senderName:   event.senderName  ?? '',
            senderAvatar: fullUrl(event.senderProfileImageUrl ?? undefined),
            content:      event.content ?? '',
            timestamp:    toUtcTs(event.sentAt ?? new Date().toISOString()),
            isRead:       false,
          }];
        });
        fetchConvsRef.current();
      }
    };

    wsService.connect(token, () => {
      if (!mountedRef.current) return;
      wsService.subscribeToPrivateMessages(handlePrivateMessage);
    });

    return () => { wsService.unsubscribe('/user/queue/messages', handlePrivateMessage); };
 
  }, [token, isHydrated]);

  useEffect(() => {
    if (isHydrated && token) fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token]);

  return {
    chats, messages, activeChat, loading, msgLoading, unavailable,
    openConversation, sendMessage,
    handleEditMessage, handleDeleteMessage,
    markUnavailable, clearUnavailable,
    refetchConversations: fetchConversations,
    myEmail,   // ← already normalized
  };
};