
import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Search, X, ChevronDown, Users, Plus } from 'lucide-react';
import ChatItem from './ChatItem';
import type { Chat, ChatTab } from '../../../../types/mentor-meaasges.types';
import api from '../../../../services/api';

interface MentorshipFilter { id: number; name: string; }

interface ChatListProps {
  chats:          Chat[];
  selectedChatId: string | null;
  onSelectChat:   (chatId: string) => void;
  activeTab:      ChatTab;
  onTabChange:    (tab: ChatTab) => void;
  onCreateRoom?:  () => void;
}

const loadMentorships = async (): Promise<MentorshipFilter[]> => {
  try {
    const res  = await api.get('api/v1/chat-room/mentor/mentorships');
    const list = res.data?.apiResponse?.mentorships ?? [];
    return (list as Array<{ id: number; name: string }>).map(m => ({ id: m.id, name: m.name }));
  } catch { return []; }
};

const ChatList: FC<ChatListProps> = ({
  chats, selectedChatId, onSelectChat,
  activeTab, onTabChange, onCreateRoom,
}) => {
  const [searchQuery,      setSearchQuery     ] = useState('');
  const [mentorships,      setMentorships     ] = useState<MentorshipFilter[]>([]);
  const [activeMentorship, setActiveMentorship] = useState<number | null>(null);
  const [showFilters,      setShowFilters     ] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'groups' && mentorships.length === 0) {
      loadMentorships().then(setMentorships);
    }
  }, [activeTab, mentorships.length]);

  useEffect(() => {
    setActiveMentorship(null);
    setSearchQuery('');
  }, [activeTab]);

  const filtered = chats.filter(chat => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      chat.userName.toLowerCase().includes(q) ||
      chat.lastMessage.toLowerCase().includes(q);

    const matchesMentorship =
      activeTab !== 'groups' ||
      activeMentorship === null ||
      chat.mentorshipId === activeMentorship;

    return matchesSearch && matchesMentorship;
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">

      {/* ── Header ── */}
      <div className="p-4 border-b border-gray-200 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          {activeTab === 'groups' && onCreateRoom && (
            <button onClick={onCreateRoom} title="Create new group"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#E8F3FF] text-[#2D9CDB] hover:bg-[#2D9CDB] hover:text-white transition">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search — fully functional */}
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'chats' ? 'Search conversations…' : 'Search groups…'}
            className="w-full pl-4 pr-10 py-2.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB]"
          />
          {searchQuery ? (
            <button
              onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            ><X className="w-4 h-4" /></button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {(['chats', 'groups'] as ChatTab[]).map(tab => (
            <button key={tab} onClick={() => onTabChange(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'text-[#2D9CDB] bg-[#E8F3FF]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {tab === 'chats' ? 'Chats' : 'Groups'}
            </button>
          ))}
        </div>

        {/* Mentorship Filters (Groups only) */}
        {activeTab === 'groups' && mentorships.length > 0 && (
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide hover:bg-gray-50 rounded-lg transition-colors"
            >
              Filter by Mentorship
              <ChevronDown className={`text-gray-400 transition-transform w-4 h-4 ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </button>
            {showFilters && (
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 mt-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <button
              onClick={() => { setActiveMentorship(null); setShowFilters(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                activeMentorship === null
                  ? 'bg-[#2D9CDB] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                activeMentorship === null ? 'bg-white' : 'bg-gray-300'
              }`} />
              All Mentorships
            </button>
            {mentorships.map(m => (
              <button
                key={m.id}
                onClick={() => { setActiveMentorship(prev => prev === m.id ? null : m.id); setShowFilters(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                  activeMentorship === m.id
                    ? 'bg-[#2D9CDB] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  activeMentorship === m.id ? 'bg-white' : 'bg-gray-300'
                }`} />
                <span className="truncate">{m.name}</span>
              </button>
            ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── List — scrollable ── */}
      <div className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
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
            {activeTab === 'groups' && !searchQuery && !activeMentorship && onCreateRoom ? (
              <>
                <div className="w-16 h-16 rounded-full bg-[#E8F3FF] flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#2D9CDB]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No groups yet</p>
                  <p className="text-xs text-gray-400">Create a group for your mentorship</p>
                </div>
                <button onClick={onCreateRoom}
                  className="px-5 py-2 bg-[#2D9CDB] text-white text-sm font-medium rounded-xl hover:bg-[#2589c3] transition flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Group
                </button>
              </>
            ) : (
              <>
                <Search className="w-8 h-8 text-gray-300 mb-1" />
                <p className="text-sm text-gray-500">
                  {searchQuery ? `No results for "${searchQuery}"` : 'Nothing here yet'}
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="text-xs text-[#2D9CDB] hover:underline">Clear search</button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;