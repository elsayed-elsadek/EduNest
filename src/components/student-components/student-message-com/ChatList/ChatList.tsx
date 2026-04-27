import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Search, X } from 'lucide-react';
import ChatItem from './ChatItem';
import type { Chat, ChatTab } from '../../../../types/mentor-meaasges.types';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
  mentorshipTags?: string[];
}

const ChatList: FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  activeTab,
  onTabChange,
  mentorshipTags = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMentorship, setActiveMentorship] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery('');
    setActiveMentorship(null);
  }, [activeTab]);

  const filtered = chats.filter(chat => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      chat.userName.toLowerCase().includes(q) ||
      chat.lastMessage.toLowerCase().includes(q);
    
    const matchesMentorship = !activeMentorship ||
      (chat.mentorshipName === activeMentorship) ||
      (chat.mentorshipId && `#${chat.mentorshipId}` === activeMentorship);
    
    return matchesSearch && matchesMentorship;
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* ── Header ── */}
      <div className="p-4 border-b border-gray-200 space-y-3 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>

        {/* Search */}
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-4 pr-10 py-2.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c2d48]"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                searchRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {(['chats', 'groups'] as ChatTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'text-[#0c2d48] bg-[#0c2d48]/10'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'chats' ? 'Chats' : 'Groups'}
            </button>
          ))}
        </div>

        {/* Mentorship Filters (Groups only) */}
        {activeTab === 'groups' && mentorshipTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filter by Mentorship</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveMentorship(null)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeMentorship === null
                    ? 'bg-[#0c2d48] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {mentorshipTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveMentorship(tag)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    activeMentorship === tag
                      ? 'bg-[#0c2d48] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── List — scrollable ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
      >
        {filtered.length > 0 ? (
          filtered.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={selectedChatId === chat.id}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
            <Search className="w-8 h-8 text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">
              {searchQuery ? `No results for "${searchQuery}"` : 'No conversations yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#0c2d48] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;