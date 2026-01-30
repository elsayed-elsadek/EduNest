

import  type { FC } from 'react';
import type { Message } from '../../../types/mentor-meaasges.types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  userName?: string;
  userAvatar?: string;
}

const MessageBubble: FC<MessageBubbleProps> = ({ message, isOwn, userName, userAvatar }) => {
  return (
    <div className={`flex gap-2 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for other user */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {userName?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div className={`
          px-4 py-2.5 rounded-2xl relative
          ${isOwn 
            ? 'bg-[#1E3A5F] text-white rounded-br-sm' 
            : 'bg-[#E8F3FF] text-gray-900 rounded-bl-sm'
          }
        `}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Emoji Reaction */}
          {message.hasEmoji && (
            <div className={`absolute -bottom-2 ${isOwn ? 'left-2' : 'right-2'} bg-white rounded-full px-2 py-0.5 shadow-sm border border-gray-200`}>
              <span className="text-sm">{message.hasEmoji}</span>
            </div>
          )}
        </div>
      </div>

      {/* Avatar for own messages */}
      {isOwn && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {userName?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;