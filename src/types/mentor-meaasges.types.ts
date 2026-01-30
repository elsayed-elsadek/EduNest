

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
  lastMessageIcon?: string; // emoji icon like 
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isSent?: boolean;
  hasEmoji?: string; // reaction emoji
}

export type ChatTab = 'chats' | 'groups';