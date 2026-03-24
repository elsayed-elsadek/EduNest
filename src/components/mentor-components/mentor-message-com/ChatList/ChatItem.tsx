
import type { FC } from 'react';
import type { Chat } from '../../../../types/mentor-meaasges.types';

interface ChatItemProps {
  chat:     Chat;
  isActive: boolean;
  onClick:  () => void;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

// ── Same UTC fix ─────────────────────────────────────────────────────────────
const toUtcTs = (ts: string): string => {
  if (!ts) return ts;
  if (ts.endsWith('Z') || ts.includes('+')) return ts;
  return ts + 'Z';
};

const formatTimeAgo = (ts: string): string => {
  if (!ts) return '';
  try {
    const diff  = Date.now() - new Date(toUtcTs(ts)).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (diff  < 0)   return 'now';
    if (mins  < 1)   return 'now';
    if (mins  < 60)  return `${mins}m`;
    if (hours < 24)  return `${hours}h`;
    if (days  < 7)   return `${days}d`;
    return new Date(toUtcTs(ts)).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
};

const Avatar: FC<{ name: string; src?: string }> = ({ name, src }) => {
  const fullSrc = src
    ? (src.startsWith('http') || src.startsWith('data:') ? src : `${BASE_URL}${src}`)
    : null;
  return (
    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
      {fullSrc ? (
        <img src={fullSrc} alt={name} className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#2D9CDB] to-[#1a7bc4] flex items-center justify-center text-white font-bold text-base">
          {name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
      )}
    </div>
  );
};

const ChatItem: FC<ChatItemProps> = ({ chat, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
      isActive ? 'bg-[#E8F3FF]' : 'hover:bg-gray-50'
    }`}
  >
    <Avatar name={chat.userName} src={chat.userAvatar} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-sm font-semibold truncate ${isActive ? 'text-[#2D9CDB]' : 'text-gray-900'}`}>
          {chat.userName}
        </span>
        {chat.timestamp && (
          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-1">
            {formatTimeAgo(chat.timestamp)}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 truncate">{chat.lastMessage}</span>
        {chat.unreadCount > 0 && (
          <span className="ml-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#2D9CDB] text-white text-[10px] font-bold flex items-center justify-center">
            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default ChatItem;
