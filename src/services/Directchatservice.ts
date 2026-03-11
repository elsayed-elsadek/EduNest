
import api from './api';
import type { ConversationDto, ConversationMessageDto } from '../types/mentor-meaasges.types';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

// GET /api/v1/conversation/all
export const getAllConversations = ():
  Promise<{ apiResponse: { conversations: ConversationDto[] } }> =>
  handleRequest(api.get('api/v1/conversation/all'));

// GET /api/v1/conversation/{conversationId}/messages
export const getConversationMessages = (conversationId: number):
  Promise<{ apiResponse: { messages: ConversationMessageDto[] } }> =>
  handleRequest(api.get(`api/v1/conversation/${conversationId}/messages`));

// PATCH /api/v1/conversation/messages/{messageId}
export const editMessage = (messageId: number, content: string) =>
  handleRequest(api.patch(`api/v1/conversation/messages/${messageId}`, { content }));

// DELETE /api/v1/conversation/messages/{messageId}
export const deleteMessage = (messageId: number) =>
  handleRequest(api.delete(`api/v1/conversation/messages/${messageId}`));