
import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import type { Message } from '../../../../types/mentor-meaasges.types';

interface MessageBubbleProps {
  message:      Message;
  isOwn:        boolean;
  isGroupChat?: boolean;
  onEdit?:      () => void;
  onDelete?:    () => void;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const buildSrc = (src?: string) => {
  if (!src) return null;
  return src.startsWith('http') || src.startsWith('data:') ? src : `${BASE_URL}${src}`;
};

const MiniAvatar: FC<{ name?: string; src?: string }> = ({ name, src }) => {
  const fullSrc = buildSrc(src);
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 self-end mb-1">
      {fullSrc ? (
        <img src={fullSrc} alt={name ?? ''} className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#2D9CDB] to-[#1a7bc4] flex items-center justify-center text-white text-xs font-bold">
          {initial}
        </div>
      )}
    </div>
  );
};

const toUtcTs = (ts: string): string => {
  if (!ts) return ts;
  if (ts.endsWith('Z') || ts.includes('+')) return ts;
  return ts + 'Z';
};

const formatTime = (ts: string): string => {
  if (!ts) return '';
  try {
    const date  = new Date(toUtcTs(ts));
    const diff  = Date.now() - date.getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (diff  < 0)    return 'now';
    if (mins  < 1)    return 'now';
    if (mins  < 60)   return `${mins}m ago`;
    if (hours < 24)   return `${hours}h ago`;
    if (days  < 7)    return `${days}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
};

const MessageBubble: FC<MessageBubbleProps> = ({
  message, isOwn, isGroupChat, onEdit, onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos,  setMenuPos ] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = message.senderName || message.senderId || '';

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isOwn || (!onEdit && !onDelete)) return;
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showMenu]);

  if (message.deleted) {
    return (
      <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <MiniAvatar name={displayName} src={message.senderAvatar} />
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {isGroupChat && (
            <span className={`text-xs font-semibold mb-1 ${isOwn ? 'mr-1 text-gray-400' : 'ml-1 text-[#2D9CDB]'}`}>
              {isOwn ? 'You' : displayName}
            </span>
          )}
          <div className="px-4 py-2.5 rounded-2xl text-sm italic text-gray-400 border border-gray-200 bg-gray-50">
            🚫 You deleted this message
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 mx-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

      <MiniAvatar name={displayName} src={message.senderAvatar} />

      {/* ✅ max-w-[70%] عشان البابل ميعداش الشاشة */}
      <div className={`flex flex-col max-w-[70%] min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>
        {isGroupChat && (
          <span className={`text-xs font-semibold mb-1 ${isOwn ? 'mr-1 text-gray-400' : 'ml-1 text-[#2D9CDB]'}`}>
            {isOwn ? 'You' : displayName}
          </span>
        )}

        <div
          onContextMenu={handleContextMenu}
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            break-words whitespace-pre-wrap overflow-wrap-anywhere
            cursor-context-menu select-text w-fit max-w-full ${
            isOwn
              ? 'bg-[#2D9CDB] text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
          }`}
        >
          {message.content}
          {message.edited && (
            <span className="text-[10px] opacity-60 ml-1.5">(edited)</span>
          )}
        </div>

        <span className="text-[10px] text-gray-400 mt-0.5 mx-1">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {showMenu && menuPos && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPos.y, left: menuPos.x, zIndex: 9999 }}
          className="bg-white rounded-xl shadow-2xl border border-gray-100 py-1 w-36 overflow-hidden"
        >
          {onEdit && (
            <button onClick={() => { setShowMenu(false); onEdit(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
              ✏️ Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => { setShowMenu(false); onDelete(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3">
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;