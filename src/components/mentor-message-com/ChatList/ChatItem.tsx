

import type { FC } from 'react';
import type { Chat } from '../../../types/mentor-meaasges.types';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

const ChatItem: FC<ChatItemProps> = ({ chat, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 
        transition-all duration-200
        ${isActive
          ? 'bg-[#E8F3FF] border-l-4 border-l-[#2D9CDB]'
          : 'hover:bg-gray-50'
        }
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          {chat.userAvatar ? (
            <img
              src={chat.userAvatar}
              alt={chat.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {chat.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Online Status */}
        {chat.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#27AE60] border-2 border-white rounded-full"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold truncate text-gray-900">
            {chat.userName}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {chat.timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {chat.lastMessageIcon && (
              <span className="text-sm">{chat.lastMessageIcon}</span>
            )}
            <p className="text-xs text-gray-600 truncate">
              {chat.lastMessage}
            </p>
          </div>
          {chat.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-[#EB5757] text-white text-xs font-bold rounded-full flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatItem;


