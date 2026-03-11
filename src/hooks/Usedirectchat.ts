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
  Chat,
  Message,
  ConversationDto,
  ConversationMessageDto,
  ConversationRealtimeEvent,
} from '../types/mentor-meaasges.types';

const toChat = (dto: ConversationDto): Chat => ({
  id:             `direct-${dto.conversationId}`,
  mode:           'direct',
  userId:         dto.otherUserEmail,
  userName:       dto.otherUserName,
  userAvatar:     dto.otherUserAvatar,
  lastMessage:    dto.lastMessage ?? '',
  timestamp:      dto.lastMessageTime ?? '',
  unreadCount:    dto.unreadCount ?? 0,
  conversationId: dto.conversationId,
});

const toMessage = (dto: ConversationMessageDto): Message => ({
  id:         String(dto.id),
  chatId:     String(dto.conversationId),
  senderId:   dto.senderEmail,
  senderName: dto.senderName,
  content:    dto.content,
  timestamp:  dto.sentAt,
  isRead:     true,
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

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await getAllConversations();
      const list = res.apiResponse?.conversations ?? [];
      if (mountedRef.current) setChats(list.map(toChat));
    } catch { /* silent */ }
    finally { if (mountedRef.current) setLoading(false); }
  }, [token]);

  const openConversation = useCallback(async (chat: Chat) => {
    if (!chat.conversationId) return;
    setActiveChat(chat);
    setMsgLoading(true);
    setMessages([]);
    try {
      const res  = await getConversationMessages(chat.conversationId);
      const list = res.apiResponse?.messages ?? [];
      if (mountedRef.current)
        setMessages([...list].reverse().map(toMessage));
    } catch { /* silent */ }
    finally { if (mountedRef.current) setMsgLoading(false); }
  }, []);

  const sendMessage = useCallback((recipientEmail: string, content: string) => {
    wsService.sendPrivateMessage(recipientEmail, content);
  }, []);

  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content } : m));
    try { await editMessage(Number(messageId), content); }
    catch { /* silent */ }
  }, []);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    try { await deleteMessage(Number(messageId)); }
    catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!token || !isHydrated) return;
    wsService.connect(token, () => {
      if (!mountedRef.current) return;
      wsService.subscribeToPrivateMessages((data) => {
        const event = data as ConversationRealtimeEvent;
        if (!mountedRef.current) return;
        if (event.type === 'DELETE' && event.messageId) {
          setMessages(prev => prev.filter(m => m.id !== String(event.messageId)));
          return;
        }
        if (event.id) {
          setMessages(prev => {
            const exists = prev.find(m => m.id === String(event.id));
            if (exists) {
              return prev.map(m =>
                m.id === String(event.id)
                  ? { ...m, content: event.content ?? m.content }  // ← fix undefined
                  : m
              );
            }
            const newMsg: Message = {
              id:         String(event.id),
              chatId:     String(event.conversationId ?? ''),
              senderId:   event.senderEmail ?? '',
              senderName: event.senderName  ?? '',
              content:    event.content     ?? '',               // ← fix undefined
              timestamp:  event.sentAt      ?? new Date().toISOString(),
              isRead:     false,
            };
            return [...prev, newMsg];
          });
          fetchConversations();
        }
      });
    });
    return () => { wsService.unsubscribe('/user/queue/messages'); };
  }, [token, isHydrated, fetchConversations]);

  useEffect(() => {
    if (isHydrated && token) fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token]);

  return {
    chats, messages, activeChat, loading, msgLoading,
    openConversation, sendMessage, handleEditMessage, handleDeleteMessage,
    refetchConversations: fetchConversations,
    myEmail: userEmail ?? '',
  };
};