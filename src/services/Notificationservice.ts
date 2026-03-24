
import api from './api';
import type { PaginatedNotifications } from '../types/mentornotification.types';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

//  GET /api/v1/notifications?page=0&size=20
export const getAllNotifications = (page = 0, size = 20): Promise<PaginatedNotifications> =>
  handleRequest(api.get('api/v1/notifications', { params: { page, size } }));

// GET /api/v1/notifications/unread?page=0&size=20
export const getUnreadNotifications = (page = 0, size = 20): Promise<PaginatedNotifications> =>
  handleRequest(api.get('api/v1/notifications/unread', { params: { page, size } }));

//  GET /api/v1/notifications/unread/count 
export const getUnreadCount = (): Promise<number> =>
  handleRequest(api.get('api/v1/notifications/unread/count'));

//  PATCH /api/v1/notifications/{id}/mark-read 
export const markNotificationRead = (id: string | number) =>
  handleRequest(api.patch(`api/v1/notifications/${id}/mark-read`));

//  PATCH /api/v1/notifications/mark-all-read 
export const markAllNotificationsRead = () =>
  handleRequest(api.patch('api/v1/notifications/mark-all-read'));

//  DELETE /api/v1/notifications/delete/{id} 
export const deleteNotification = (id: string | number) =>
  handleRequest(api.delete(`api/v1/notifications/delete/${id}`));

//  DELETE /api/v1/notifications/delete-for-user
export const deleteAllNotifications = () =>
  handleRequest(api.delete('api/v1/notifications/delete-for-user'));