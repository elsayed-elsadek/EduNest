
import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import type { Chat, Message } from '../../../types/mentor-meaasges.types';

interface ChatWindowProps {
  chat:              Chat;
  messages:          Message[];
  currentUserId:     string;
  currentUserAvatar?: string;
  onSendMessage:     (content: string) => void;
  onBack?:           () => void;
  showBackButton?:   boolean;
  // optional — direct chat only
  onEditMessage?:    (messageId: string, content: string) => Promise<void>;
  onDeleteMessage?:  (messageId: string) => Promise<void>;
  // optional — group chat only
  onRoomImageClick?: () => void;
}

const ChatWindow: FC<ChatWindowProps> = ({
  chat,
  messages,
  currentUserId,
  currentUserAvatar,
  onSendMessage,
  onBack,
  showBackButton,
  onEditMessage,
  onDeleteMessage,
  onRoomImageClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingId,      setEditingId     ] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEditStart = (msg: Message) => {
    setEditingId(msg.id);
    setEditingContent(msg.content);
  };

  const handleEditSave = async () => {
    if (!editingId || !onEditMessage) return;
    await onEditMessage(editingId, editingContent);
    setEditingId(null);
    setEditingContent('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingContent('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header — passes onRoomImageClick so clicking group avatar opens modal */}
      <ChatHeader
        chat={chat}
        onBack={onBack}
        showBackButton={showBackButton}
        onRoomImageClick={onRoomImageClick}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA] custom-scrollbar space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map(message => {
            const isOwn = message.senderId === currentUserId;

            // ── inline edit UI ──────────────────────────────────────────────
            if (editingId === message.id) {
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className="w-full max-w-xs md:max-w-md">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#2D9CDB] focus:outline-none resize-none bg-white"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-1 justify-end">
                      <button onClick={handleEditCancel}
                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">
                        Cancel
                      </button>
                      <button onClick={handleEditSave}
                        className="text-xs text-white bg-[#2D9CDB] hover:bg-[#2589c3] px-3 py-1 rounded-lg">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                // ── sender name shown in group chats for received messages ──
                userName={
                  isOwn
                    ? 'You'
                    : (message.senderName || chat.userName)
                }
                // ── avatar: own = currentUserAvatar, others = their initials ──
                userAvatar={isOwn ? currentUserAvatar : chat.userAvatar}
                senderName={message.senderName}
                isGroupChat={chat.mode === 'room'}
                onEdit={
                  isOwn && onEditMessage
                    ? () => handleEditStart(message)
                    : undefined
                }
                onDelete={
                  isOwn && onDeleteMessage
                    ? () => onDeleteMessage(message.id)
                    : undefined
                }
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={onSendMessage} />
    </div>
  );
};

export default ChatWindow;