
import type  { FC } from 'react';
import {  useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import type { Chat, Message } from '../../../types/mentor-meaasges.types';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  currentUserId: string;
  currentUserAvatar?: string;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatWindow: FC<ChatWindowProps> = ({
  chat,
  messages,
  currentUserId,
  currentUserAvatar,
  onSendMessage,
  onBack,
  showBackButton,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader chat={chat} onBack={onBack} showBackButton={showBackButton} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            userName={message.senderId === currentUserId ? 'You' : chat.userName}
            userAvatar={message.senderId === currentUserId ? currentUserAvatar : chat.userAvatar}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={onSendMessage} />
    </div>
  );
};

export default ChatWindow;