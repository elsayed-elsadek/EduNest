
export interface ConversationDto {
  conversationId:          string;
  otherUserName:           string;
  otherUserEmail:          string;
  otherUserProfileImageUrl?: string | null;  // ← actual API field
  lastMessage?:            string;
  lastMessageTime?:        string;
  unreadCount?:            number;
}

export interface ConversationMessageDto {
  id:                    string;
  conversationId:        string;
  senderEmail:           string;
  senderName:            string;
  senderProfileImageUrl?: string | null;   // ← actual API field
  content:               string;
  sentAt:                string;
}

export interface ConversationRealtimeEvent {
  type?:           'DELETE';
  messageId?:      string;
  id?:             string;
  content?:        string;
  senderEmail?:    string;
  recipientEmail?: string;
  senderName?:     string;
  senderProfileImageUrl?: string | null;
  sentAt?:         string;
  conversationId?: string;
}

export interface RoomMessageDto {
  id:                    number;
  message:               string;
  senderName:            string;
  senderEmail:           string;
  senderProfileImageUrl: string | null;
  roomId:                number;
  time:                  string;
}

export type ChatTab  = 'chats' | 'groups';
export type ChatMode = 'direct' | 'room';

export interface Chat {
  id:              string;
  mode:            ChatMode;
  userId:          string;
  userName:        string;
  userAvatar?:     string;
  lastMessage:     string;
  timestamp:       string;
  unreadCount:     number;
  isOnline?:       boolean;
  conversationId?: string;
  roomId?:         number;
  mentorshipId?:   number;
  mentorshipName?: string;
  creatorEmail?:   string;
}

export interface Message {
  id:            string;
  chatId:        string;
  senderId:      string;
  senderName:    string;
  senderAvatar?: string;
  content:       string;
  timestamp:     string;
  isRead:        boolean;
  edited?:       boolean;
  deleted?:      boolean;
}