
import { useState } from 'react';
import type { FC } from 'react';
import ChatItem from './ChatItem';
import type { Chat, ChatTab } from '../../../types/mentor-meaasges.types';

interface ChatListProps {
  chats:          Chat[];
  selectedChatId: string | null;
  onSelectChat:   (chatId: string) => void;
  activeTab:      ChatTab;
  onTabChange:    (tab: ChatTab) => void;
  onCreateRoom?:  () => void;
}

const ChatList: FC<ChatListProps> = ({
  chats, selectedChatId, onSelectChat,
  activeTab, onTabChange, onCreateRoom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          {activeTab === 'groups' && onCreateRoom && (
            <button
              onClick={onCreateRoom}
              title="Create new group"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#E8F3FF] text-[#2D9CDB] hover:bg-[#2D9CDB] hover:text-white transition font-bold text-lg"
            >＋</button>
          )}
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-4 pr-10 py-2.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB]"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onTabChange('chats')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'chats' ? 'text-[#2D9CDB] bg-[#E8F3FF]' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >Chats</button>
          <button
            onClick={() => onTabChange('groups')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'groups' ? 'text-[#2D9CDB] bg-[#E8F3FF]' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >Groups</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={selectedChatId === chat.id}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
            {activeTab === 'groups' && onCreateRoom ? (
              <>
                <div className="w-16 h-16 rounded-full bg-[#E8F3FF] flex items-center justify-center text-3xl">👥</div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No groups yet</p>
                  <p className="text-xs text-gray-400">Create a group for your mentorship</p>
                </div>
                <button onClick={onCreateRoom}
                  className="px-5 py-2 bg-[#2D9CDB] text-white text-sm font-medium rounded-xl hover:bg-[#2589c3] transition">
                  ＋ Create Group
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-1">🔍</div>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No results found' : 'No conversations yet'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;