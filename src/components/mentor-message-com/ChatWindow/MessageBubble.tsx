
import type { FC } from 'react';
import { useState } from 'react';
import type { Message } from '../../../types/mentor-meaasges.types';

interface MessageBubbleProps {
  message:      Message;
  isOwn:        boolean;
  userName:     string;
  userAvatar?:  string;
  senderName?:  string;    // actual sender name from message DTO
  isGroupChat?: boolean;   // show sender name above bubble in group
  onEdit?:      () => void;
  onDelete?:    () => void;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const MiniAvatar: FC<{ name: string; src?: string }> = ({ name, src }) => {
  const fullSrc = src
    ? (src.startsWith('http') || src.startsWith('data:') ? src : `${BASE_URL}${src}`)
    : null;

  return (
    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
      {fullSrc ? (
        <img src={fullSrc} alt={name} className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#2D9CDB] to-[#1a7bc4] flex items-center justify-center text-white text-xs font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

const formatTime = (ts: string): string => {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const MessageBubble: FC<MessageBubbleProps> = ({
  message, isOwn, userName, userAvatar,
  senderName, isGroupChat, onEdit, onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // The display name: use senderName from DTO if available, else userName
  const displayName = senderName || userName;

  return (
    <div
      className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Avatar — always shown (sender's own avatar for received, currentUser for sent) */}
      <MiniAvatar
        name={isOwn ? 'You' : displayName}
        src={userAvatar}
      />

      <div className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name — only in group chat for received messages */}
        {isGroupChat && !isOwn && (
          <span className="text-xs text-gray-500 font-medium mb-0.5 ml-1">
            {displayName}
          </span>
        )}

        {/* Bubble + menu */}
        <div className="relative group flex items-end gap-1">
          {/* 3-dot menu — own messages only */}
          {isOwn && (onEdit || onDelete) && (
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity self-center">
              <button
                onClick={() => setShowMenu(v => !v)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5"  cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute bottom-full right-0 mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 w-28">
                  {onEdit && (
                    <button
                      onClick={() => { setShowMenu(false); onEdit(); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>✏️</span> Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { setShowMenu(false); onDelete(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Message content */}
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
              isOwn
                ? 'bg-[#2D9CDB] text-white rounded-br-sm'
                : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
            }`}
          >
            {message.content}
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 mt-0.5 mx-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;