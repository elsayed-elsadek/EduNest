
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { wsService } from '../services/Websocketservice';
import {
  getMyRooms, getRoomMessages,
  createRoom        as apiCreateRoom,
  editRoomMessage   as apiEditMsg,
  deleteRoomMessage as apiDeleteMsg,
  deleteRoom        as apiDeleteRoom,
  type RoomApiDto,
} from '../services/Roomchatservice';
import type { Chat, Message, RoomMessageDto } from '../types/mentor-meaasges.types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const fullUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
};

// ── Force treat timestamp as UTC (backend sends no timezone info) ────────────
const toUtcTs = (ts: string): string => {
  if (!ts) return ts;
  // Already has timezone → leave it
  if (ts.endsWith('Z') || ts.includes('+')) return ts;
  return ts + 'Z';
};

const toChat = (dto: RoomApiDto): Chat => ({
  id:             `room-${dto.roomId}`,
  mode:           'room',
  userId:         String(dto.roomId),
  userName:       dto.roomName,
  userAvatar:     dto.roomImageUrl ?? undefined,
  lastMessage:    dto.lastMessageContent ?? '',
  timestamp:      toUtcTs(dto.lastMessageTime ?? ''),
  unreadCount:    0,
  roomId:         dto.roomId,
  mentorshipId:   dto.mentorshipId,
  mentorshipName: dto.mentorshipName,
  creatorEmail:   dto.creatorEmail,
});

const toMessage = (dto: RoomMessageDto): Message => ({
  id:           String(dto.id),
  chatId:       String(dto.roomId),
  senderId:     (dto.senderEmail ?? '').toLowerCase().trim(),   // ← normalize + guard
  senderName:   dto.senderName   ?? '',
  senderAvatar: fullUrl(dto.senderProfileImageUrl),
  content:      dto.message      ?? '',
  timestamp:    toUtcTs(dto.time),
  isRead:       true,
});

const sortByRecent = (rooms: Chat[]): Chat[] =>
  [...rooms].sort((a, b) => {
    if (!a.timestamp && !b.timestamp) return 0;
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

const dedupe = (msgs: Message[]): Message[] => {
  const map = new Map<string, Message>();
  msgs.forEach(m => map.set(m.id, m));
  return Array.from(map.values());
};

export const useRoomChat = () => {
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const userEmail  = useAuthStore((s) => s.userEmail);

  const [rooms,      setRooms     ] = useState<Chat[]>([]);
  const [messages,   setMessages  ] = useState<Message[]>([]);
  const [activeRoom, setActiveRoom] = useState<Chat | null>(null);
  const [loading,    setLoading   ] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);

  const mountedRef        = useRef(true);
  const subscribedRoomRef = useRef<number | null>(null);
  const activeRoomRef     = useRef<Chat | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchRooms = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await getMyRooms();
      const list = res.apiResponse?.Rooms ?? [];
      if (mountedRef.current) setRooms(sortByRecent(list.map(toChat)));
    } catch { /* silent */ }
    finally { if (mountedRef.current) setLoading(false); }
  }, [token]);

  const openRoom = useCallback(async (room: Chat) => {
    if (!room.roomId) return;

    if (subscribedRoomRef.current && subscribedRoomRef.current !== room.roomId) {
      wsService.unsubscribeFromRoom(subscribedRoomRef.current);
      subscribedRoomRef.current = null;
    }

    setActiveRoom(room);
    activeRoomRef.current = room;
    setMsgLoading(true);
    setMessages([]);

    try {
      const res  = await getRoomMessages(room.roomId, 30);
      const list = res.apiResponse?.Messages ?? [];
      if (mountedRef.current)
        setMessages([...list].reverse().map(toMessage));
    } catch { /* silent */ }
    finally { if (mountedRef.current) setMsgLoading(false); }

    wsService.connect(token!, () => {
      if (!mountedRef.current) return;
      if (subscribedRoomRef.current === room.roomId) return;

      wsService.subscribeToRoom(room.roomId!, (data) => {
        if (!mountedRef.current) return;
        const dto = data as RoomMessageDto & { type?: string; messageId?: number };

        if (dto.type === 'DELETE' && dto.messageId) {
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== String(dto.messageId));
            const newLast = filtered[filtered.length - 1];
            setRooms(rooms => sortByRecent(rooms.map(r =>
              r.roomId === room.roomId
                ? { ...r, lastMessage: newLast?.content ?? '', timestamp: newLast?.timestamp ?? r.timestamp }
                : r
            )));
            return filtered;
          });
          return;
        }

        const incoming = toMessage(dto);

        setMessages(prev => {
          const existing = prev.find(m => m.id === incoming.id);
          if (existing) {
            if (incoming.content === existing.content) return prev;
            return prev.map(m => m.id === incoming.id
              ? { ...m, content: incoming.content, edited: true }
              : m
            );
          }
          return dedupe([...prev, incoming]);
        });

        setRooms(prev => sortByRecent(
          prev.map(r => r.roomId === room.roomId
            ? { ...r, lastMessage: dto.message, timestamp: toUtcTs(dto.time) }
            : r
          )
        ));
      });
      subscribedRoomRef.current = room.roomId!;
    });
  }, [token]);

  const sendMessage = useCallback((roomId: number, content: string) => {
    wsService.sendToRoom(roomId, content);
  }, []);

  // ── Edit: optimistic update → WS echo will also arrive (dedupe handles it)
  const handleEditMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    const roomId = activeRoomRef.current?.roomId;
    if (!roomId) return;
    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, content, edited: true } : m)
    );
    await apiEditMsg(roomId, Number(messageId), content);
  }, []);

  // ── Delete: REMOVE from array (clean) — "deleted" label only in current session
  //    On re-enter, API won't return deleted message → it's naturally gone
  const handleDeleteMessage = useCallback(async (messageId: string): Promise<void> => {
    const roomId = activeRoomRef.current?.roomId;
    if (!roomId) return;

    setMessages(prev => {
      const filtered = prev.filter(m => m.id !== messageId);
      const newLast = filtered[filtered.length - 1];
      setRooms(rooms => sortByRecent(rooms.map(r =>
        r.roomId === roomId
          ? { ...r, lastMessage: newLast?.content ?? '', timestamp: newLast?.timestamp ?? r.timestamp }
          : r
      )));
      return filtered;
    });

    try {
      await apiDeleteMsg(roomId, Number(messageId));
    } catch {
      const res = await getRoomMessages(roomId, 30).catch(() => null);
      if (res && mountedRef.current) {
        const msgs = [...res.apiResponse.Messages].reverse().map(toMessage);
        setMessages(msgs);
        const newLast = msgs[msgs.length - 1];
        setRooms(prev => sortByRecent(prev.map(r =>
          r.roomId === roomId
            ? { ...r, lastMessage: newLast?.content ?? '', timestamp: newLast?.timestamp ?? r.timestamp }
            : r
        )));
      }
    }
  }, []);

  const handleDeleteRoom = useCallback(async (roomId: number): Promise<void> => {
    await apiDeleteRoom(roomId);
    if (!mountedRef.current) return;
    setRooms(prev => prev.filter(r => r.roomId !== roomId));
    setActiveRoom(prev => {
      if (prev?.roomId === roomId) { activeRoomRef.current = null; return null; }
      return prev;
    });
    setMessages([]);
  }, []);

  const handleUpdateRoomImage = useCallback((roomId: number, newImageUrl: string) => {
    if (!mountedRef.current) return;
    setRooms(prev => prev.map(r => r.roomId === roomId ? { ...r, userAvatar: newImageUrl } : r));
    setActiveRoom(prev => prev?.roomId === roomId ? { ...prev, userAvatar: newImageUrl } : prev);
  }, []);

  const handleCreateRoom = useCallback(async (mentorshipId: number, name: string) => {
    await apiCreateRoom(mentorshipId, name);
    await fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (isHydrated && token) fetchRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token]);

  return {
    rooms, messages, activeRoom, loading, msgLoading,
    openRoom, sendMessage,
    handleEditMessage, handleDeleteMessage,
    handleCreateRoom, handleUpdateRoomImage, handleDeleteRoom,
    refetchRooms: fetchRooms,
    myEmail: userEmail ?? '',
  };
};