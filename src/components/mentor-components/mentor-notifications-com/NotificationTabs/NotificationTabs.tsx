
import type { FC } from 'react';

interface NotificationTabsProps {
  activeTab: 'all' | 'unread';
  unreadCount: number;
  allCount: number;
  onTabChange: (tab: 'all' | 'unread') => void;
  onMarkAllRead?: () => void;
  onDeleteAll?: () => void;
}

const NotificationTabs: FC<NotificationTabsProps> = ({
  activeTab,
  unreadCount,
  allCount,
  onTabChange,
  onMarkAllRead,
  onDeleteAll,
}) => {
  return (
    <div className="w-full space-y-3 mb-8">

      <div className="bg-[var(--sidebar-bg)] dark:bg-gray-800 p-1 rounded-full flex items-center w-full shadow-md">

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
        <div className="flex flex-wrap items-center justify-end gap-4 pr-2">
          <button
            onClick={onMarkAllRead}
            className="flex shrink-0 items-center gap-1.5 text-green-600 dark:text-green-400 text-[13px] font-bold hover:opacity-80 transition-all group"
          >
            <div className="px-3 py-1 border-[1.5px]  border-green-600 dark:border-green-400 rounded-xl flex items-center justify-center gap-2 group-hover:bg-green-600/10 whitespace-nowrap">
              Mark All as Read
            </div>
          </button>

          {onDeleteAll && (
            <button
              onClick={onDeleteAll}
              className="flex shrink-0 items-center gap-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600  hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationTabs;


