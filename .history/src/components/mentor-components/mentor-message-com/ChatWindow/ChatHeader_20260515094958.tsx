
import type { FC } from 'react';
import type { Chat } from '../../../../types/mentor-meaasges.types';

interface ChatHeaderProps {
  chat:              Chat;
  onBack?:           () => void;
  showBackButton?:   boolean;
  onRoomImageClick?: () => void;
  onViewMembers?:    () => void;   // ← 3-dot → View Members
  isMembersOpen?:    boolean;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const Avatar: FC<{
  src?: string; name: string; size?: string;
  onClick?: () => void; editable?: boolean;
}> = ({ src, name, size = 'w-10 h-10', onClick, editable }) => {
  const fullSrc = src
    ? (src.startsWith('http') || src.startsWith('data:') ? src : `${BASE_URL}${src}`)
    : null;
  return (
    <div
      className={`relative ${size} rounded-full overflow-hidden flex-shrink-0 ${onClick ? 'cursor-pointer group' : ''}`}
      onClick={onClick}
    >
      {fullSrc ? (
        <img src={fullSrc} alt={name} className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#2D9CDB] to-[#1a7bc4] flex items-center justify-center text-white font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {editable && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )}
    </div>
  );
};

const ChatHeader: FC<ChatHeaderProps> = ({
  chat, onBack, showBackButton,
  onRoomImageClick, onViewMembers, isMembersOpen,
}) => {
  const isGroup = chat.mode === 'room';

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
      {showBackButton && onBack && (
        <button onClick={onBack}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Avatar — group is clickable to change image */}
      <Avatar
        src={chat.userAvatar}
        name={chat.userName}
        onClick={isGroup && onRoomImageClick ? onRoomImageClick : undefined}
        editable={isGroup && !!onRoomImageClick}
      />

      {/* Name + subtitle */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{chat.userName}</h3>
        {isGroup ? (
          <p className="text-xs text-gray-400 truncate">
            {/* ← show mentorshipName, fallback to ID */}
            {chat.mentorshipName ?? (chat.mentorshipId ? `Mentorship #${chat.mentorshipId}` : 'Group Chat')}
          </p>
        ) : (
          <p className="text-xs text-[#4CAF50] font-medium">Onldddine</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {isGroup && onRoomImageClick && (
          <button onClick={onRoomImageClick} title="Change group photo"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}

        {/* 3-dot menu — click → View Members (group) or just dots (direct) */}
        {isGroup && onViewMembers ? (
          <button
            onClick={onViewMembers}
            title="View members"
            className={`w-8 h-8 flex items-center justify-center rounded-full transition text-gray-500 ${
              isMembersOpen ? 'bg-[#E8F3FF] text-[#2D9CDB]' : 'hover:bg-gray-100'
            }`}
          >
            {/* People icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        ) : (
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5"  cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;