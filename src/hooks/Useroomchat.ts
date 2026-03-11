
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { wsService } from '../services/Websocketservice';
import {
  getMyRooms,
  getRoomMessages,
  createRoom as apiCreateRoom,
  type RoomApiDto,
} from '../services/Roomchatservice';
import type { Chat, Message, RoomMessageDto } from '../types/mentor-meaasges.types';

const toChat = (dto: RoomApiDto): Chat => ({
  id:           `room-${dto.roomId}`,
  mode:         'room',
  userId:       String(dto.roomId),
  userName:     dto.roomName,
  userAvatar:   dto.roomImageUrl ?? undefined,
  lastMessage:  dto.lastMessageContent ?? '',
  timestamp:    dto.lastMessageTime    ?? '',
  unreadCount:  0,
  roomId:       dto.roomId,
  mentorshipId: dto.mentorshipId,
});

const toMessage = (dto: RoomMessageDto): Message => ({
  id:         String(dto.id),
  chatId:     String(dto.roomId),
  senderId:   dto.senderEmail,
  senderName: dto.senderName,
  content:    dto.message,
  timestamp:  dto.time,
  isRead:     true,
});

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
      if (mountedRef.current) setRooms(list.map(toChat));
    } catch { /* silent */ }
    finally { if (mountedRef.current) setLoading(false); }
  }, [token]);

  const openRoom = useCallback(async (room: Chat) => {
    if (!room.roomId) return;
    if (subscribedRoomRef.current && subscribedRoomRef.current !== room.roomId) {
      wsService.unsubscribeFromRoom(subscribedRoomRef.current);
    }
    setActiveRoom(room);
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
      wsService.subscribeToRoom(room.roomId!, (data) => {
        const dto = data as RoomMessageDto;
        if (!mountedRef.current) return;
        setMessages(prev => [...prev, toMessage(dto)]);
      });
      subscribedRoomRef.current = room.roomId!;
    });
  }, [token]);

  const sendMessage = useCallback((roomId: number, content: string) => {
    wsService.sendToRoom(roomId, content);
  }, []);

  const handleCreateRoom = useCallback(async (mentorshipId: number, name: string) => {
    await apiCreateRoom(mentorshipId, name);
    await fetchRooms();
  }, [fetchRooms]);

  // ← Called from RoomImageModal after successful upload with the new full URL
  const handleUpdateRoomImage = useCallback((roomId: number, newImageUrl: string) => {
    if (!mountedRef.current) return;
    setRooms(prev =>
      prev.map(r => r.roomId === roomId ? { ...r, userAvatar: newImageUrl } : r)
    );
    setActiveRoom(prev =>
      prev?.roomId === roomId ? { ...prev, userAvatar: newImageUrl } : prev
    );
  }, []);

  useEffect(() => {
    if (isHydrated && token) fetchRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token]);

  return {
    rooms, messages, activeRoom, loading, msgLoading,
    openRoom, sendMessage,
    handleCreateRoom, handleUpdateRoomImage,
    refetchRooms: fetchRooms,
    myEmail: userEmail ?? '',
  };
};