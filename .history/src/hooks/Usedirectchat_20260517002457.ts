
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { wsService } from '../services/Websocketservice';
import {
  getAllConversations,
  getConversationMessages,
  editMessage,
  deleteMessage,
} from '../services/Directchatservice';
import type {
  Chat, Message,
  ConversationDto, ConversationMessageDto, ConversationRealtimeEvent,
} from '../types/mentor-meaasges.types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const fullUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
};

const toUtcTs = (ts: string | undefined): string => {
  if (!ts) return '';
  if (ts.endsWith('Z') || ts.includes('+')) return ts;
  return ts + 'Z';
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

  const mountedRef    = useRef(true);
  const activeChatRef = useRef<Chat | null>(null);
  const fetchConvsRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // ← normalized myEmail used everywhere
  const myEmail = (userEmail ?? '').toLowerCase().trim();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
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
      // Virtual chat (no conversation yet) — just clear messages
      setActiveChat(chat);
      activeChatRef.current = chat;
      setMessages([]);
      return;
    }
    // ── Optimistically clear the unread badge immediately ──
    setChats(prev =>
      prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c)
    );
    setActiveChat(chat);
    activeChatRef.current = chat;
    setMsgLoading(true);
    setMessages([]);
    try {
      const res  = await getConversationMessages(chat.conversationId);
      const data = res as { apiResponse?: { messages?: ConversationMessageDto[] } };
      const list = data.apiResponse?.messages ?? [];
      if (mountedRef.current)
        setMessages([...list].reverse().map(toMessage));
    } catch { /* silent */ }
    finally { if (mountedRef.current) setMsgLoading(false); }
  }, []);

  const sendMessage = useCallback((recipientEmail: string, content: string) => {
    wsService.sendPrivateMessage(recipientEmail, content);
  }, []);

  const handleEditMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    const recipientEmail = activeChatRef.current?.userId;
    if (!recipientEmail) return;
    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, content, edited: true } : m)
    );
    try { await editMessage(Number(messageId), content, recipientEmail); }
    catch { /* silent */ }
    fetchConvsRef.current();
  }, []);

  const handleDeleteMessage = useCallback(async (messageId: string): Promise<void> => {
    const recipientEmail = activeChatRef.current?.userId;
    if (!recipientEmail) return;
    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, deleted: true, content: '' } : m)
    );
    try {
      await deleteMessage(Number(messageId), recipientEmail);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      fetchConvsRef.current();
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!token || !isHydrated) return;

    wsService.connect(token, () => {
      if (!mountedRef.current) return;

      wsService.subscribeToPrivateMessages((data) => {
        if (!mountedRef.current) return;
        const event = data as ConversationRealtimeEvent;

        if (event.type === 'DELETE' && event.messageId) {
          setMessages(prev =>
            prev.map(m => m.id === String(event.messageId)
              ? { ...m, deleted: true, content: '' } : m
            )
          );
          setTimeout(() => {
            if (mountedRef.current)
              setMessages(prev => prev.filter(m => m.id !== String(event.messageId)));
          }, 800);
          fetchConvsRef.current();
          return;
        }

        if (event.id) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === String(event.id));
            if (exists) {
              return prev.map(m =>
                m.id === String(event.id)
                  ? { ...m, content: event.content ?? m.content, edited: true }
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

<<<<<<< HEAD
    return () => { wsService.unsubscribe('/user/queue/messages'); };
=======
    const handlePrivateMessage = (data: unknown) => {
      if (!mountedRef.current) return;
      const event = data as ConversationRealtimeEvent;

      if (event.type === 'DELETE' && event.messageId) {
        setMessages(prev =>
          prev.map(m => m.id === String(event.messageId)
            ? { ...m, deleted: true, content: '' } : m
          )
        );
        setTimeout(() => {
          if (mountedRef.current)
            setMessages(prev => prev.filter(m => m.id !== String(event.messageId)));
        }, 800);
        fetchConvsRef.current();
        return;
      }

      if (event.id) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === String(event.id));
          if (exists) {
            return prev.map(m =>
              m.id === String(event.id)
                ? { ...m, content: event.content ?? m.content, edited: true }
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
>>>>>>> Student-role
 
  }, [token, isHydrated]);

  useEffect(() => {
    if (isHydrated && token) fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token]);

  return {
    chats, messages, activeChat, loading, msgLoading,
    openConversation, sendMessage,
    handleEditMessage, handleDeleteMessage,
    refetchConversations: fetchConversations,
    myEmail,   // ← already normalized
  };
};