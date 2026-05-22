<<<<<<< HEAD
=======
import { useState } from 'react';
>>>>>>> Student-role
import type { FC } from 'react';
import type { Chat } from '../../../../types/mentor-meaasges.types';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const toUtcTs = (ts: string): string => {
  if (!ts) return ts;
  if (ts.endsWith('Z') || ts.includes('+')) return ts;
  return ts + 'Z';
};

const formatTimeAgo = (ts: string): string => {
  if (!ts) return '';
  try {
    const diff = Date.now() - new Date(toUtcTs(ts)).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (diff < 0) return 'now';
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(toUtcTs(ts)).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const Avatar: FC<{ name: string; src?: string }> = ({ name, src }) => {
  const fullSrc = src
    ? src.startsWith('http') || src.startsWith('data:')
      ? src
      : `${BASE_URL}${src}`
    : null;
  return (
    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
      {fullSrc ? (
        <img
          src={fullSrc}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#0c2d48] to-[#083a62] flex items-center justify-center text-white font-bold text-base">
          {name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
const ChatItem: FC<ChatItemProps> = ({ chat, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2 ${
      isActive
        ? 'bg-[#0c2d48]/5 border-l-[#0c2d48]'
        : 'hover:bg-gray-50 border-l-transparent'
    }`}
  >
    <Avatar name={chat.userName} src={chat.userAvatar} />
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-900 text-sm truncate">{chat.userName}</h4>
      <p className="text-xs text-gray-500 truncate line-clamp-1">{chat.lastMessage || 'No messages yet'}</p>
    </div>
    {chat.unreadCount > 0 && (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0c2d48] text-white text-xs font-bold flex-shrink-0">
        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
      </span>
    )}
    <span className="text-xs text-gray-400 flex-shrink-0">{formatTimeAgo(chat.timestamp)}</span>
  </div>
);

export default ChatItem;
=======
const ChatItem: FC<ChatItemProps> = ({ chat, isActive, onClick }) => {
  const unread = Number(chat.unreadCount ?? 0) || 0;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-l-2 ${
        isActive
          ? 'bg-[#0c2d48]/5 border-l-[#0c2d48]'
          : unread > 0
          ? 'bg-red-50/40 border-l-red-400 hover:bg-red-50/60'
          : 'hover:bg-gray-50 border-l-transparent'
      }`}
    >
      <Avatar name={chat.userName} src={chat.userAvatar} />

      <div className="flex-1 min-w-0">
        {/* Name row — badge sits right next to the name */}
        <div className="flex items-center gap-1.5 min-w-0">
          <h4
            className={`text-sm truncate ${
              unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'
            }`}
          >
            {chat.userName}
          </h4>

          {unread > 0 && (
            <div
              className="relative flex-shrink-0"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {/* Badge */}
              <span
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white leading-none"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 0 0 2px rgba(239,68,68,0.25)',
                  animation: 'chatBadgePulse 2s ease-in-out infinite',
                }}
              >
                {unread > 99 ? '99+' : unread}
              </span>

              {/* Tooltip */}
              {showTooltip && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 pointer-events-none"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <div className="bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl">
                    {unread} unread {unread === 1 ? 'message' : 'messages'}
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid #111827',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className={`text-xs truncate line-clamp-1 ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
          {chat.lastMessage || 'No messages yet'}
        </p>
      </div>

      <span className={`text-xs flex-shrink-0 ${unread > 0 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
        {formatTimeAgo(chat.timestamp)}
      </span>
    </div>
  );
};

export default ChatItem;
>>>>>>> Student-role
