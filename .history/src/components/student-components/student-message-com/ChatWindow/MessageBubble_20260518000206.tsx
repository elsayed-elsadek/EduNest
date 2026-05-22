
import { type FC, useState, useRef, useEffect } from 'react';
import { Ban, Edit3, Trash2 } from 'lucide-react';
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
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#0c2d48] to-[#083a62] flex items-center justify-center text-white text-xs font-bold">
          {initial}
        </div>
      )}
    </div>
  );
};

const formatTime = (ts: string): string => {
  if (!ts) return '';
  try {
    const utcTs = ts.endsWith('Z') || ts.includes('+') ? ts : ts + 'Z';
    const date  = new Date(utcTs);
    const diff  = Date.now() - date.getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (diff < 0) return 'now';
    if (mins  < 1)  return 'now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
};

const MessageBubble: FC<MessageBubbleProps> = ({
  message, isOwn, isGroupChat, onEdit, onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef                 = useRef<HTMLDivElement>(null);
  const displayName             = message.senderName || message.senderId || '';
  const hasActions              = isOwn && (onEdit || onDelete);

  // أغلق الميو لو ضغط برّا
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (message.deleted) {
    return (
      <div className={`flex items-end gap-1.5 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <MiniAvatar name={displayName} src={message.senderAvatar} />
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {isGroupChat && (
            <span className={`text-xs font-semibold mb-1 ${isOwn ? 'mr-1 text-gray-400' : 'ml-1 text-[#0c2d48]'}`}>
              {isOwn ? 'You' : displayName}
            </span>
          )}
          <div className="px-4 py-2.5 rounded-2xl text-sm italic text-gray-400 border border-gray-200 bg-gray-50 flex items-center gap-2">
            <Ban className="w-4 h-4" />
            You deleted this message
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 mx-1">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-1.5 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <MiniAvatar name={displayName} src={message.senderAvatar} />

      <div className={`flex flex-col max-w-[70%] min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>
        {isGroupChat && (
          <span className={`text-xs font-semibold mb-1 ${isOwn ? 'mr-1 text-gray-400' : 'ml-1 text-[#0c2d48]'}`}>
            {isOwn ? 'You' : displayName}
          </span>
        )}

        {/* البابل + الميو */}
        <div className="relative" ref={menuRef}>
          <div
            onClick={() => hasActions && setMenuOpen(prev => !prev)}
            className={`px-4 py-2.5 rounded-2xl text-sm transition-colors select-none
              ${hasActions ? 'cursor-pointer' : ''}
              ${isOwn
                ? 'bg-[#0c2d48] text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
          >
            {(() => {
              const content = message.content ?? '';
              // Backend stores attachments in content as the filename, but uploads are served from /uploads
              // Example content: "📎 Good team-bro (1).webp"
              const cleaned = content.replace(/^📎\s*/u, '').trim();
              const hasAttachmentName = cleaned.length > 0 && /\.[a-zA-Z0-9]{1,8}$/u.test(cleaned);

              const url = hasAttachmentName ? (cleaned.startsWith('http') ? cleaned : `${BASE_URL}/uploads/${cleaned}`) : null;

              // Image preview if looks like image by extension
              const isImg = !!url && /\.(png|jpe?g|gif|webp|bmp|svg)$/iu.test(cleaned);
              if (isImg && url) {
                return (
                  <div className="flex flex-col gap-2">
                    <img
                      src={url}
                      alt={cleaned}
                      className="max-w-[220px] max-h-[220px] rounded-xl object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="break-words text-xs text-white/80">{cleaned}</p>
                  </div>
                );
              }

              if (hasAttachmentName && url) {
                return (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 underline decoration-dotted underline-offset-2"
                    title={cleaned}
                  >
                    <span className="break-words">{cleaned}</span>
                  </a>
                );
              }

              return <p className="break-words">{content}</p>;
            })()}

            <span className={`text-xs mt-1 block ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* WhatsApp-style popup menu */}
          {menuOpen && hasActions && (
            <div
              className={`absolute z-50 bottom-full mb-1.5 bg-white rounded-xl shadow-lg ring-1 ring-black/8 
                overflow-hidden min-w-[110px]
                ${isOwn ? 'right-0' : 'left-0'}`}
            >
              {onEdit && (
                <button
                  onClick={() => { setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 
                    hover:bg-gray-50 transition-colors font-medium"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              )}
              {onEdit && onDelete && (
                <div className="h-px bg-gray-100 mx-3" />
              )}
              {onDelete && (
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 
                    hover:bg-red-50 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;