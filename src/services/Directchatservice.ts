
import api from './api';

// Let Axios rejections pass through untouched so callers keep `response.status`
// and the `normalized` metadata attached by the api.ts response interceptor.
const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> =>
  (await req).data;

// GET /api/v1/conversation/all
export const getAllConversations = () =>
  handleRequest(api.get('api/v1/conversation/all'));

// GET /api/v1/conversation/{conversationId}/messages
export const getConversationMessages = (conversationId: string, size = 20, beforeId?: string) =>
  handleRequest(api.get(`api/v1/conversation/${conversationId}/messages`, {
    params: { size, ...(beforeId ? { beforeId } : {}) },
  }));

// PATCH /api/v1/conversation/messages/{messageId}
// Body: { content }
export const editMessage = (messageId: string, content: string) =>
  handleRequest(api.patch(`api/v1/conversation/messages/${messageId}`, {
    content,
  }));

// DELETE /api/v1/conversation/messages/{messageId}
// No request body.
export const deleteMessage = (messageId: string) =>
  handleRequest(api.delete(`api/v1/conversation/messages/${messageId}`));