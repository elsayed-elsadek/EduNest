
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

/** Conversation and message ids are opaque UUID strings — never inferred from email. */
const asOpaqueId = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const conversationMessageKey = (conversationId: string, messageId: string): string =>
  `${conversationId}:${messageId}`;

/** Compares only fields that a CREATE/EDIT broadcast can meaningfully change. */
const hasSameRealtimeContent = (a: Message, b: Message): boolean =>
  a.content    === b.content &&
  a.timestamp  === b.timestamp &&
  a.senderId   === b.senderId &&
  a.senderName === b.senderName &&
  a.senderAvatar === b.senderAvatar;

const upsertMessage = (prev: Message[], next: Message): Message[] => {
  const index = prev.findIndex(m => m.id === next.id);
  if (index === -1) return [...prev, next];
  if (hasSameRealtimeContent(prev[index], next)) return prev;

  const updated = [...prev];
  updated[index] = { ...next, isRead: prev[index].isRead };
  return updated;
};

/** Keeps realtime/optimistic messages that arrived while history was loading. */
const mergeHistoryWithRealtime = (
  history: Message[],
  overrides: Map<string, Message>,
  isDeleted: (messageId: string) => boolean,
): Message[] => {
  const merged = history.filter(m => !isDeleted(m.id));
  const indexById = new Map(merged.map((m, index) => [m.id, index] as const));

  overrides.forEach((next, id) => {
    if (isDeleted(id)) return;
    const index = indexById.get(id);
    if (index === undefined) {
      indexById.set(id, merged.length);
      merged.push(next);
      return;
    }
    const current = merged[index];
    merged[index] = {
      ...next,
      isRead: current.isRead,
      // An EDIT broadcast can arrive before the history entry it updates.
      edited: next.content !== current.content ? true : next.edited ?? current.edited,
    };
  });

  return merged;
};

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

  const activeConversationIdRef = useRef<string | null>(null);
  const historyGenerationRef   = useRef(0);
  const messageOverridesRef    = useRef<Map<string, Message>>(new Map());
  const deletedMessageKeysRef   = useRef<Set<string>>(new Set());

  // ← normalized myEmail used everywhere
  const myEmail = (userEmail ?? '').toLowerCase().trim();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const commitMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
    setMessages(prev => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const resetConversationState = useCallback(() => {
    historyGenerationRef.current += 1;
    messageOverridesRef.current.clear();
    activeChatRef.current = null;
    activeConversationIdRef.current = null;
    setActiveChat(null);
    setMessages([]);
    messagesRef.current = [];
    setMsgLoading(false);
  }, []);

  const markUnavailable = useCallback(() => {
    if (!mountedRef.current) return;
    resetConversationState();
    setUnavailable(true);
  }, [resetConversationState]);

  const clearUnavailable = useCallback(() => {
    if (!mountedRef.current) return;
    resetConversationState();
    setUnavailable(false);
  }, [resetConversationState]);

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
    const conversationId = asOpaqueId(chat.conversationId);
    if (!conversationId) {
      // No real conversation to open: never fabricate one from an email.
      markUnavailable();
      return;
    }

    // A new load invalidates any in-flight history response and any realtime
    // overrides collected for the previously active conversation.
    const generation = ++historyGenerationRef.current;
    messageOverridesRef.current.clear();
    setUnavailable(false);
    // ── Optimistically clear the unread badge immediately ──
    setChats(prev =>
      prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c)
    );
    setActiveChat(chat);
    activeChatRef.current = chat;
    activeConversationIdRef.current = conversationId;
    setMsgLoading(true);
    commitMessages(() => []);

    try {
      const res  = await getConversationMessages(conversationId);
      const data = res as { apiResponse?: { messages?: ConversationMessageDto[] } };
      const list = data.apiResponse?.messages ?? [];

      if (
        !mountedRef.current ||
        generation !== historyGenerationRef.current ||
        activeConversationIdRef.current !== conversationId
      ) return;

      const isDeleted = (messageId: string) =>
        deletedMessageKeysRef.current.has(conversationMessageKey(conversationId, messageId));
      const loaded = [...list]
        .reverse()
        .map(toMessage)
        .filter(m => m.chatId === conversationId && !isDeleted(m.id));

      commitMessages(prev => {
        // Re-check inside the updater: conversation switching may have happened
        // while React was scheduling the state update.
        if (
          generation !== historyGenerationRef.current ||
          activeConversationIdRef.current !== conversationId
        ) return prev;
        return mergeHistoryWithRealtime(loaded, messageOverridesRef.current, isDeleted);
      });
      setUnavailable(false);
    } catch (error) {
      if (
        isUnavailableConversationError(error) &&
        mountedRef.current &&
        generation === historyGenerationRef.current
      ) {
        resetConversationState();
        setUnavailable(true);
      }
      // All other errors keep the existing silent behavior.
    } finally {
      if (mountedRef.current && generation === historyGenerationRef.current) setMsgLoading(false);
    }
  }, [commitMessages, markUnavailable, resetConversationState]);

  const sendMessage = useCallback((recipientEmail: string, content: string) => {
    wsService.sendPrivateMessage(recipientEmail, content);
  }, []);

  const handleEditMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    const previous = messagesRef.current.find(m => m.id === messageId);
    const previousOverride = messageOverridesRef.current.get(messageId);
    const optimistic = previous ? { ...previous, content, edited: true } : undefined;
    if (optimistic) messageOverridesRef.current.set(messageId, optimistic);

    commitMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, content, edited: true } : m)
    );
    try {
      await editMessage(messageId, content);
    } catch {
      // Roll back the optimistic edit without surfacing backend details.
      if (optimistic) {
        if (previousOverride) messageOverridesRef.current.set(messageId, previousOverride);
        else messageOverridesRef.current.delete(messageId);
      }
      commitMessages(prev => previous
        ? prev.map(m => m.id === messageId ? previous : m)
        : prev.filter(m => m.id !== messageId)
      );
    } finally {
      fetchConvsRef.current();
    }
  }, [commitMessages]);

  const handleDeleteMessage = useCallback(async (messageId: string): Promise<void> => {
    const conversationId = activeConversationIdRef.current;
    if (!conversationId) return;

    const deletedKey = conversationMessageKey(conversationId, messageId);
    const previousMessages = messagesRef.current;
    const previousIndex = previousMessages.findIndex(m => m.id === messageId);
    const previous = previousMessages[previousIndex];
    const previousOverride = messageOverridesRef.current.get(messageId);

    // Mark immediately so an in-flight history response cannot resurrect it.
    deletedMessageKeysRef.current.add(deletedKey);
    messageOverridesRef.current.delete(messageId);
    commitMessages(prev =>
      prev.filter(m => !(m.id === messageId && m.chatId === conversationId))
    );

    try {
      await deleteMessage(messageId);
    } catch {
      deletedMessageKeysRef.current.delete(deletedKey);
      if (previousOverride) messageOverridesRef.current.set(messageId, previousOverride);
      // Put the original message back at its original position on failure.
      commitMessages(prev => {
        if (prev.some(m => m.id === messageId)) return prev;
        const next = [...prev];
        if (previous) next.splice(Math.min(previousIndex, next.length), 0, previous);
        return next;
      });
    } finally {
      fetchConvsRef.current();
    }
  }, [commitMessages]);

  const handlePrivateMessage = useCallback((data: unknown) => {
    if (!mountedRef.current) return;

    const event = data as ConversationRealtimeEvent;
    const eventConversationId = asOpaqueId(event.conversationId);
    const activeConversationId = activeConversationIdRef.current;

    // Private frames are globally delivered; route them by opaque UUID only.
    if (!eventConversationId || !activeConversationId || eventConversationId !== activeConversationId) {
      return;
    }

    if (event.type === 'DELETE') {
      const messageId = asOpaqueId(event.messageId);
      if (!messageId) return;

      deletedMessageKeysRef.current.add(conversationMessageKey(activeConversationId, messageId));
      messageOverridesRef.current.delete(messageId);
      commitMessages(prev =>
        prev.filter(m => !(m.id === messageId && m.chatId === activeConversationId))
      );
      fetchConvsRef.current();
      return;
    }

    const messageId = asOpaqueId(event.id);
    if (!messageId) return;
    if (deletedMessageKeysRef.current.has(conversationMessageKey(activeConversationId, messageId))) {
      return;
    }

    const existing = messagesRef.current.find(
      m => m.id === messageId && m.chatId === activeConversationId
    );
    const content = event.content ?? existing?.content ?? '';
    const next: Message = {
      id:           messageId,
      chatId:       activeConversationId,
      senderId:     event.senderEmail != null
        ? event.senderEmail.toLowerCase().trim()
        : existing?.senderId ?? '',
      senderName:   event.senderName ?? existing?.senderName ?? '',
      senderAvatar: event.senderProfileImageUrl !== undefined
        ? fullUrl(event.senderProfileImageUrl)
        : existing?.senderAvatar,
      content,
      timestamp:    event.sentAt
        ? toUtcTs(event.sentAt)
        : existing?.timestamp ?? toUtcTs(new Date().toISOString()),
      isRead:       existing?.isRead ?? false,
      edited:       existing && content !== existing.content ? true : existing?.edited,
    };

    if (existing && hasSameRealtimeContent(existing, next)) return;

    messageOverridesRef.current.set(messageId, next);
    commitMessages(prev => upsertMessage(prev, next));
    fetchConvsRef.current();
  }, [commitMessages]);

  useEffect(() => {
    if (!token || !isHydrated) return;

    // One stable logical handler for the single global private-message queue.
    wsService.connect(token, () => {
      if (!mountedRef.current) return;
      wsService.subscribeToPrivateMessages(handlePrivateMessage);
    });

    return () => { wsService.unsubscribe('/user/queue/messages', handlePrivateMessage); };
  }, [token, isHydrated, handlePrivateMessage]);

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