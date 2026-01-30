
import type { FC } from 'react';

interface NotificationTabsProps {
  activeTab: 'all' | 'unread';
  unreadCount: number;
  allCount: number;
  onTabChange: (tab: 'all' | 'unread') => void;
  onMarkAllRead?: () => void;
}

const NotificationTabs: FC<NotificationTabsProps> = ({
  activeTab,
  unreadCount,
  allCount,
  onTabChange,
  onMarkAllRead,
}) => {
  return (
    <div className="w-full space-y-3 mb-8">

      <div className="bg-[#0c2d48] p-1 rounded-full flex items-center w-full shadow-md">

        {/* All */}
        <button
          onClick={() => onTabChange('all')}
          className={`
            flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm transition-all duration-300
            w-[20%]
            ${activeTab === 'all' ? 'bg-white text-[#0c2d48]' : 'bg-transparent text-white hover:bg-white/5'}
          `}
        >
          <span className={`flex items-center justify-center min-w-[22px] h-5 px-1 rounded-full text-[10px] font-black ${activeTab === 'all' ? 'bg-[#EF4444] text-white' : 'bg-[#4B6A80] text-white'}`}>
            {allCount}
          </span>
          All
        </button>

        {/* Unread */}
        <button
          onClick={() => onTabChange('unread')}
          className={`
            flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm transition-all duration-300
            w-[80%]
            ${activeTab === 'unread' ? 'bg-white text-[#0c2d48]' : 'bg-transparent text-white hover:bg-white/5'}
          `}
        >
          <span className={`flex items-center justify-center min-w-[22px] h-5 px-1 rounded-full text-[10px] font-black ${activeTab === 'unread' ? 'bg-[#EF4444] text-white' : 'bg-[#4B6A80] text-white'}`}>
            {unreadCount}
          </span>
          Unread
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="flex justify-end pr-2">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-[#22C55E] text-[13px] font-bold hover:opacity-80 transition-all group"
          >

            <div className="w-4 h-4 border-[1.5px] border-[#22C55E] rounded-[4px] flex items-center justify-center group-hover:bg-[#22C55E]/10">
              <svg width="10" height="8" viewBox="0 0 12 10" fill="none" className="text-[#22C55E]">
                <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationTabs;