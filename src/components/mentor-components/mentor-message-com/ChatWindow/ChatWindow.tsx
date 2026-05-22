
import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';
import ChatHeader    from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput  from './MessageInput';
import MembersPanel  from '../Memberspanel';
import type { Chat, Message } from '../../../../types/mentor-meaasges.types';

interface ChatWindowProps {
  chat:              Chat;
  messages:          Message[];
  currentUserId:     string;
  onSendMessage:     (content: string) => void;
  onBack?:           () => void;
  showBackButton?:   boolean;
  onEditMessage?:    (messageId: string, content: string) => Promise<void>;
  onDeleteMessage?:  (messageId: string) => Promise<void>;
  onRoomImageClick?: () => void;
  onDeleteRoom?:     () => void;
}

const ChatWindow: FC<ChatWindowProps> = ({
  chat, messages, currentUserId,
  onSendMessage, onBack, showBackButton,
  onEditMessage, onDeleteMessage,
  onRoomImageClick, onDeleteRoom,
}) => {
  const scrollAreaRef  = useRef<HTMLDivElement>(null);
  const [editingId,      setEditingId     ] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showMembers,    setShowMembers   ] = useState(false);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => { setShowMembers(false); setEditingId(null); }, [chat.id]);

  const handleEditStart  = (msg: Message) => { setEditingId(msg.id); setEditingContent(msg.content); };
  const handleEditCancel = () => { setEditingId(null); setEditingContent(''); };
  const handleEditSave   = async () => {
    if (!editingId || !onEditMessage) return;
    await onEditMessage(editingId, editingContent);
    setEditingId(null); setEditingContent('');
  };

  const visibleMessages = messages.filter(m => !m.deleted && m.content !== '');

  // ── Case-insensitive email comparison ──────────────────────────────────────
  const isOwn = (msg: Message) =>
    !!currentUserId &&
    msg.senderId.toLowerCase().trim() === currentUserId.toLowerCase().trim();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white relative">

      <div className="flex-shrink-0">
        <ChatHeader
          chat={chat}
          onBack={onBack}
          showBackButton={showBackButton}
          onRoomImageClick={onRoomImageClick}
          onViewMembers={
            chat.mode === 'room' && chat.roomId
              ? () => setShowMembers(v => !v)
              : undefined
          }
          isMembersOpen={showMembers}
        />
      </div>

      <div
        ref={scrollAreaRef}
        className="flex-1 min-h-0 overflow-y-auto px-5 py-4 bg-[#FAFAFA] space-y-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
      >
        {visibleMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          visibleMessages.map(message => {
            const own = isOwn(message);

            if (editingId === message.id) {
              return (
                <div key={message.id}
                  className={`flex ${own ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className="w-full max-w-xs md:max-w-md">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#2D9CDB] focus:outline-none resize-none bg-white"
                      rows={2} autoFocus
                    />
                    <div className="flex gap-2 mt-1 justify-end">
                      <button onClick={handleEditCancel}
                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">Cancel</button>
                      <button onClick={handleEditSave}
                        className="text-xs text-white bg-[#2D9CDB] hover:bg-[#2589c3] px-3 py-1 rounded-lg">Save</button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={own}
                isGroupChat={chat.mode === 'room'}
                // Edit/Delete only for OWN messages and only if handler exists
                onEdit={  own && typeof onEditMessage   === 'function' ? () => handleEditStart(message)    : undefined}
                onDelete={own && typeof onDeleteMessage === 'function' ? () => onDeleteMessage(message.id) : undefined}
              />
            );
          })
        )}
      </div>

      <div className="flex-shrink-0">
        <MessageInput onSend={onSendMessage} />
      </div>

      {showMembers && chat.roomId && (
        <MembersPanel
          roomId={chat.roomId}
          roomName={chat.userName}
          creatorEmail={chat.creatorEmail}
          myEmail={currentUserId}
          onClose={() => setShowMembers(false)}
          onDeleteRoom={
            onDeleteRoom ? () => { setShowMembers(false); onDeleteRoom(); } : undefined
          }
        />
      )}
    </div>
  );
};

export default ChatWindow;