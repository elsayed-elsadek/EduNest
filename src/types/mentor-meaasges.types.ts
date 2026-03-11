

export interface ConversationDto {
  conversationId:  number;
  otherUserName:   string;
  otherUserEmail:  string;
  otherUserAvatar?: string;
  lastMessage?:    string;
  lastMessageTime?: string;
  unreadCount?:    number;
}

export interface ConversationMessageDto {
  id:           number;
  conversationId: number;
  senderEmail:  string;
  senderName:   string;
  content:      string;
  sentAt:       string;  
}

export interface ConversationRealtimeEvent {
  type?:      'DELETE';
  messageId?: number;   // for DELETE
  // if no type → it's a new/edited message
  id?:        number;
  content?:   string;
  senderEmail?: string;
  senderName?:  string;
  sentAt?:      string;
  conversationId?: number;
}

// Chat Rooms (Group) 

export interface ChatRoomDto {
  id:       number;
  name:     string;
  imageUrl?: string;
  mentorshipId?: number;
}

export interface RoomMessageDto {
  id:          number;
  message:     string;     
  senderName:  string;
  senderEmail: string;
  roomId:      number;
  time:        string;      
}

//  UI types (shared between direct & room)

export type ChatTab = 'chats' | 'groups';
export type ChatMode = 'direct' | 'room';

export interface Chat {
  id:             string;
  mode:           ChatMode;
  userId:         string;    
  userName:       string;
  userAvatar?:    string;
  lastMessage:    string;
  timestamp:      string;
  unreadCount:    number;
  isOnline?:      boolean;
  isPinned?:      boolean;
  lastMessageIcon?: string;
  // direct-only
  conversationId?: number;
  // room-only
  roomId?:        number;
  mentorshipId?:  number;
}

export interface Message {
  id:         string;
  chatId:     string;
  senderId:   string;   // email
  senderName: string;
  content:    string;
  timestamp:  string;
  isRead:     boolean;
  hasEmoji?:  string;
}