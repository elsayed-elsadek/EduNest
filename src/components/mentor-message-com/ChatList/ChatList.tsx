
import type { FC } from 'react';
import { useState } from 'react';
import ChatItem from './ChatItem';
import type { Chat, ChatTab } from '../../../types/mentor-meaasges.types';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const ChatList: FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ChatTab>('chats');

  const filteredChats = chats.filter(chat =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Chats</h2>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name"
            className="w-full pl-4 pr-10 py-2.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB]"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'chats'
                ? 'text-[#2D9CDB] bg-[#E8F3FF]'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'groups'
                ? 'text-[#2D9CDB] bg-[#E8F3FF]'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'chats' ? (
          filteredChats.length > 0 ? (
            filteredChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={selectedChatId === chat.id}
                onClick={() => onSelectChat(chat.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm text-gray-500">No chats found</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm text-gray-500">No groups yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;


