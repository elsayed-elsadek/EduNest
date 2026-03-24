
import api from './api';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

// GET /api/v1/conversation/all
export const getAllConversations = () =>
  handleRequest(api.get('api/v1/conversation/all'));

// GET /api/v1/conversation/{conversationId}/messages
export const getConversationMessages = (conversationId: number, size = 20, beforeId?: number) =>
  handleRequest(api.get(`api/v1/conversation/${conversationId}/messages`, {
    params: { size, ...(beforeId ? { beforeId } : {}) },
  }));

// PATCH /api/v1/conversation/messages/{messageId}
// Body: { content, recipientEmail }
export const editMessage = (messageId: number, content: string, recipientEmail: string) =>
  handleRequest(api.patch(`api/v1/conversation/messages/${messageId}`, {
    content,
    recipientEmail,
  }));

// DELETE /api/v1/conversation/messages/{messageId}
// Body: { recipientEmail }
export const deleteMessage = (messageId: number, recipientEmail: string) =>
  handleRequest(api.delete(`api/v1/conversation/messages/${messageId}`, {
    data: { recipientEmail },
  }));