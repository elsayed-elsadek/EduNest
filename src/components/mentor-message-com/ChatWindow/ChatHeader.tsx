

import type { FC } from 'react';
import type { Chat } from '../../../types/mentor-meaasges.types';

interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatHeader: FC<ChatHeaderProps> = ({ chat, onBack, showBackButton }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Back Button - Mobile Only */}
        {showBackButton && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            {chat.userAvatar ? (
              <img src={chat.userAvatar} alt={chat.userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {chat.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#27AE60] border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* User Info */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">{chat.userName}</h3>
          <p className="text-xs text-gray-500">
            {chat.isOnline ? 'Active 5m ago' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2">
        {/* Video Call Button */}
        <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;