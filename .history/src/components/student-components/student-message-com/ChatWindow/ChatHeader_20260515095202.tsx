
import type { FC } from 'react';
import type { Chat } from '../../../../types/mentor-meaasges.types';

interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
  showBackButton?: boolean;
  onViewMembers?: () => void;
  isMembersOpen?: boolean;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const Avatar: FC<{ src?: string; name: string; size?: string }> = ({ src, name, size = 'w-10 h-10' }) => {
  const fullSrc = src
    ? (src.startsWith('http') || src.startsWith('data:') ? src : `${BASE_URL}${src}`)
    : null;
  return (
    <div className={`relative ${size} rounded-full overflow-hidden flex-shrink-0`}>
      {fullSrc ? (
        <img src={fullSrc} alt={name} className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#0c2d48] to-[#083a62] flex items-center justify-center text-white font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

const ChatHeader: FC<ChatHeaderProps> = ({
  chat, onBack, showBackButton, onViewMembers, isMembersOpen,
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

      <Avatar src={chat.userAvatar} name={chat.userName} />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{chat.userName}</h3>
        {isGroup ? (
          <p className="text-xs text-gray-400 truncate">
            {chat.mentorshipName ?? (chat.mentorshipId ? `Mentorship #${chat.mentorshipId}` : 'Group Chat')}
          </p>
        ) : (

          // Online use online if back end handle it, otherwise just show mentorship name or ID
          <p className="text-xs text-[#4CAF50] font-medium">Online</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {isGroup && onViewMembers && (
          <button
            onClick={onViewMembers}
            title="View members"
            className={`w-8 h-8 flex items-center justify-center rounded-full transition text-gray-500 ${
              isMembersOpen ? 'bg-[#E8F3FF] text-[#0c2d48]' : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;