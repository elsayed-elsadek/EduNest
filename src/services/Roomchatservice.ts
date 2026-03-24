
import api from './api';
import type { RoomMessageDto } from '../types/mentor-meaasges.types';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

export interface RoomApiDto {
  roomId:                 number;
  roomName:               string;
  roomImageUrl:           string | null;
  mentorshipId:           number;
  mentorshipName:         string;
  creatorEmail:           string;
  creatorName:            string;
  lastMessageContent:     string | null;
  lastMessageTime:        string | null;
  lastMessageSenderEmail: string | null;
  lastMessageSenderName:  string | null;
}

export interface RoomMemberDto {
  userId:       number;
  email:        string;
  firstName:    string;
  lastName:     string;
  role:         string;
  userImageUrl: string | null;   // ← actual field from API
}

// GET /api/v1/chat-room/my-rooms
export const getMyRooms = ():
  Promise<{ apiResponse: { Rooms: RoomApiDto[] } }> =>
  handleRequest(api.get('api/v1/chat-room/my-rooms'));

// GET /api/v1/chat-room/{mid}
export const getRoomsByMentorship = (mentorshipId: number):
  Promise<{ apiResponse: { Rooms: RoomApiDto[] } }> =>
  handleRequest(api.get(`api/v1/chat-room/${mentorshipId}`));

// GET /api/v1/chat-room/{roomId}/messages
export const getRoomMessages = (roomId: number, size = 20, beforeId?: number):
  Promise<{ apiResponse: { Messages: RoomMessageDto[] } }> =>
  handleRequest(api.get(`api/v1/chat-room/${roomId}/messages`, {
    params: { size, ...(beforeId ? { beforeId } : {}) },
  }));

// GET /api/v1/chat-room/{roomId}/members
export const getRoomMembers = (roomId: number):
  Promise<{ apiResponse: { members: RoomMemberDto[] } }> =>
  handleRequest(api.get(`api/v1/chat-room/${roomId}/members`));

// POST /api/v1/chat-room/create/{mentorshipId}
export const createRoom = (mentorshipId: number, name: string) =>
  handleRequest(api.post(`api/v1/chat-room/create/${mentorshipId}`, { name }));

// POST /api/v1/chat-room/{roomId}/join
export const joinRoom = (roomId: number) =>
  handleRequest(api.post(`api/v1/chat-room/${roomId}/join`));

// PUT /api/v1/chat-room/{roomId}/image
export const updateRoomImage = (roomId: number, image: File) => {
  const form = new FormData();
  form.append('image', image);
  return handleRequest(api.put(`api/v1/chat-room/${roomId}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }));
};

// PATCH /api/v1/chat-room/{roomId}/messages/{messageId}?content=xxx
export const editRoomMessage = (roomId: number, messageId: number, content: string) =>
  handleRequest(api.patch(`api/v1/chat-room/${roomId}/messages/${messageId}`, null, {
    params: { content },
  }));

// DELETE /api/v1/chat-room/{roomId}/messages/{messageId}
export const deleteRoomMessage = (roomId: number, messageId: number) =>
  handleRequest(api.delete(`api/v1/chat-room/${roomId}/messages/${messageId}`));

// DELETE /api/v1/chat-room/{roomId}   (creator only)
export const deleteRoom = (roomId: number) =>
  handleRequest(api.delete(`api/v1/chat-room/${roomId}`));