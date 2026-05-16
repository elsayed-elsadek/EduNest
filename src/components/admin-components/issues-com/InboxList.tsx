
import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { AdminMessage, FilterTab } from '../../../types/admin-role-types/issues.types';
import StatusPill from './StatusPill';

interface InboxListProps {
  messages      : AdminMessage[];
  selectedId    : number | null;
  filter        : FilterTab;
  onSelect      : (id: number) => void;
  onFilter      : (f: FilterTab) => void;
  onDeleteOne?  : (id: number) => void;
  unreadCount   : number;
  deleting?     : boolean;
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All'          },
  { key: 'pending',   label: 'Pending'      },
  { key: 'review',    label: 'Under Review' },
  { key: 'completed', label: 'Completed'    },
];

const InboxList: FC<InboxListProps> = ({
  messages,
  selectedId,
  filter,
  onSelect,
  onFilter,
  onDeleteOne,
  unreadCount,
  deleting,
}) => {
  const [contextMenu, setContextMenu] = useState<{ id: number; x: number; y: number } | null>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const filtered =
    filter === 'all' ? messages : messages.filter(m => m.status === filter);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, msgId: number) => {
    e.preventDefault();
    setContextMenu({ id: msgId, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="w-full md:w-[300px] lg:w-[320px] shrink-0 flex flex-col
                    bg-white border-r border-gray-100 h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[16px] font-bold text-gray-900">Inbox</span>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full"
                  style={{ background: '#0f5e8b' }}>
              {unreadCount} NEW
            </span>
          )}
        </div>

        {/* Filter tabs — scrollable on very small screens */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onFilter(key)}
              className={`text-[12px] px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap
                ${filter === key
                  ? 'bg-[#e8f3fa] text-[#0f5e8b] font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
            No messages
          </div>
        ) : (
          filtered.map(msg => (
            <div
              key={msg.id}
              onClick={() => onSelect(msg.id)}
              onContextMenu={(e) => handleContextMenu(e, msg.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition-colors cursor-pointer
                          ${selectedId === msg.id
                            ? 'bg-[#e8f3fa] border-l-2 border-l-[#0f5e8b]'
                            : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-900">
                  {msg.unread && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#0f5e8b' }} />
                  )}
                  {msg.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] text-gray-400 shrink-0 ml-2">{msg.time}</span>
                  <StatusPill status={msg.status} />
                </div>
              </div>
              <p className="text-[12.5px] text-gray-500 truncate mb-1.5">{msg.preview}</p>
            </div>
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && onDeleteOne && (
        <div
          ref={contextRef}
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            zIndex: 50,
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
        >
          <button
            onClick={() => {
              onDeleteOne(contextMenu.id);
              setContextMenu(null);
            }}
            disabled={deleting}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default InboxList;