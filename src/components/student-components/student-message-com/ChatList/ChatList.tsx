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
  const [showFilters, setShowFilters] = useState(false);
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide hover:bg-gray-50 rounded-lg transition-colors"
            >
              Filter by Mentorship
              <span className={`text-gray-400 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}>
                ▼
              </span>
            </button>
            {showFilters && (
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 mt-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <button
              onClick={() => { setActiveMentorship(null); setShowFilters(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                activeMentorship === null
                  ? 'bg-[#0c2d48] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                activeMentorship === null ? 'bg-white' : 'bg-gray-300'
              }`} />
              All Mentorships
            </button>
            {mentorshipTags.map(tag => (
              <button
                key={tag}
                onClick={() => { setActiveMentorship(tag); setShowFilters(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                  activeMentorship === tag
                    ? 'bg-[#0c2d48] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  activeMentorship === tag ? 'bg-white' : 'bg-gray-300'
                }`} />
                <span className="truncate">{tag}</span>
              </button>
            ))}
              </div>
            )}
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