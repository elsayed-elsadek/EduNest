export type ApiMessageStatus = 'PENDING' | 'UNDER_REVIEW' | 'COMPLETED';
export interface ContactMessageApi {
  id:      number;
  name:    string;
  email:   string;
  phone:   string;
  message: string;
  status:  ApiMessageStatus;
}
//  UI shapes 
export type MessageStatus = 'pending' | 'review' | 'completed';
export type FilterTab     = 'all' | MessageStatus;
export type NotifType     = 'Info' | 'Warning' | 'Success' | 'Error';

export interface AdminMessage {
  id:       number;
  name:     string;
  initials: string;
  preview:  string;
  status:   MessageStatus;
  time:     string;
  received: string;
  email:    string;
  phone:    string;
  body:     string;
  unread?:  boolean;
}

export interface NotificationFormData {
  email:   string;
  title:   string;
  type:    NotifType;
  content: string;
}

export const API_TO_UI: Record<ApiMessageStatus, MessageStatus> = {
  PENDING:      'pending',
  UNDER_REVIEW: 'review',
  COMPLETED:    'completed',
};

export const UI_TO_API: Record<MessageStatus, ApiMessageStatus> = {
  pending:   'PENDING',
  review:    'UNDER_REVIEW',
  completed: 'COMPLETED',
};

// Helpers 
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function mapApiMessage(dto: ContactMessageApi): AdminMessage {
  return {
    id:       dto.id,
    name:     dto.name,
    initials: initials(dto.name),
    preview:  dto.message.slice(0, 60),
    status:   API_TO_UI[dto.status] ?? 'pending',
    time:     '',
    received: `Message #${dto.id}`,
    email:    dto.email,
    phone:    dto.phone,
    body:     dto.message,
    unread:   dto.status === 'PENDING',
  };
}