
import api from './api';
import type { RoomMessageDto } from '../types/mentor-meaasges.types';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

//  Actual API response shape 
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

// GET /api/v1/chat-room/my-rooms
export const getMyRooms = ():
  Promise<{ apiResponse: { Rooms: RoomApiDto[] } }> =>
  handleRequest(api.get('api/v1/chat-room/my-rooms'));

// GET /api/v1/chat-room/{mid} — rooms by mentorship
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
export interface RoomMemberDto {
  userId:    number;
  email:     string;
  firstName: string;
  lastName:  string;
  role:      string;
}
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