
import api from '../api';
import type { ContactMessageApi, ApiMessageStatus } from '../../types/admin-role-types/issues.types';

export type AllResponse = {
  apiResponse: {
    Status: string;
    Data: ContactMessageApi[];
  };
};

export type SingleResponse = {
  apiResponse: {
    Status: string;
    Data: ContactMessageApi;
  };
};

export type OkResponse = {
  apiResponse: {
    Status: string;
  };
};

const handle = async <T>(promise: Promise<{ data: T }>): Promise<T> => {
  const res = await promise; 
  return res.data;
};

// GET /api/v1/contact/all-messages
export const getAllMessages = (): Promise<AllResponse> =>
  handle(api.get('api/v1/contact/all-messages'));

// GET /api/v1/contact/message/{id}
export const getMessage = (id: number): Promise<SingleResponse> =>
  handle(api.get(`api/v1/contact/message/${id}`));

// DELETE /api/v1/contact/message/{id}
export const deleteMessage = (id: number): Promise<OkResponse> =>
  handle(api.delete(`api/v1/contact/message/${id}`));

// DELETE /api/v1/contact/messages
export const deleteAllMessages = (): Promise<OkResponse> =>
  handle(api.delete('api/v1/contact/messages'));

// PUT /api/v1/contact/message/{id}/status?status=PENDING
export const updateMessageStatus = (
  id: number,
  status: ApiMessageStatus,
): Promise<OkResponse> =>
  handle(
    api.put(`api/v1/contact/message/${id}/status`, null, {
      params: { status },
    }),
  );

// POST /api/v1/contact/message/{id}/notification?title=xxx
// Body must be a JSON-encoded string: "\"content here\""
export const sendNotification = (
  id: number,
  title: string,
  content: string,
): Promise<OkResponse> =>
  handle(
    api.post(
      `api/v1/contact/message/${id}/notification`,
      JSON.stringify(content), 
      {
        params:  { title },
        headers: { 'Content-Type': 'application/json' },
      },
    ),
  );

// POST /api/v1/contact/message/{id}/reply

export const sendReply = (id: number, replyText: string): Promise<OkResponse> =>
  handle(
    api.post(
      `api/v1/contact/message/${id}/reply`,
      JSON.stringify(replyText), 
      {
        headers: { 'Content-Type': 'application/json' },
      },
    ),
  );