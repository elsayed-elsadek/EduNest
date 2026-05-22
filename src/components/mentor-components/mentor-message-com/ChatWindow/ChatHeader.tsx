
import type { FC } from 'react';
import { ArrowLeft, Camera, Users, MoreHorizontal } from 'lucide-react';
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
          <Camera className="w-4 h-4 text-white" />
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
          <ArrowLeft className="w-5 h-5 text-gray-600" />
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

          // Online use online if back end handle it, otherwise just show mentorship name or ID
          <p className="text-xs text-[#4CAF50] font-medium"></p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {isGroup && onRoomImageClick && (
          <button onClick={onRoomImageClick} title="Change group photo"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
            <Camera className="w-4 h-4" />
          </button>
        )}

        {/* Members/menu button */}
        {isGroup && onViewMembers ? (
          <button
            onClick={onViewMembers}
            title="View members"
            className={`w-8 h-8 flex items-center justify-center rounded-full transition text-gray-500 ${
              isMembersOpen ? 'bg-[#E8F3FF] text-[#2D9CDB]' : 'hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>
        ) : (
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;