import { type FC, useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import type { FilterTab } from '../../../types/admin-role-types/issues.types';
import { useIssues }    from '../../../hooks/admin-roleHooks/Useissues';
import InboxList        from '../../../components/admin-components/issues-com/InboxList';
import MessageDetail    from '../../../components/admin-components/issues-com/MessageDetail';

const IssuesPage: FC = () => {
  const {
    messages, loading, isError,
    deleteOne, deleteAll, setStatus, sendNotif, sendReply,
    deleting, deletingAll, sendingReply, sendingNotif,
  } = useIssues();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter,     setFilter]     = useState<FilterTab>('all');
  const [showDetail, setShowDetail] = useState(false);

  const selectedMsg = selectedId !== null
    ? messages.find(m => m.id === selectedId) ?? null
    : null;

  const unreadCount = messages.filter(m => m.unread).length;

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setShowDetail(true);
  };

  const handleDeleteOne = (id: number) => {
    deleteOne(id);
    if (selectedId === id) { setSelectedId(null); setShowDetail(false); }
  };

  const handleDeleteAll = () => {
    if (!window.confirm('Delete ALL messages? This cannot be undone.')) return;
    deleteAll();
    setSelectedId(null);
    setShowDetail(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading messages…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center text-gray-400">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm font-medium">Failed to load messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top bar with delete all ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-[15px] font-bold text-gray-900">Contact Messages</h1>
          <p className="text-[12px] text-gray-400">{messages.length} total · {unreadCount} unread</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={deletingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-red-600
                       border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deletingAll ? 'Deleting…' : 'Delete All'}
          </button>
        )}
      </div>

      {/* ── Two-panel layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Inbox list */}
        <div className={`${showDetail ? 'hidden' : 'flex'} md:flex w-full md:w-auto h-full`}>
          <InboxList
            messages    ={messages}
            selectedId  ={selectedId}
            filter      ={filter}
            onSelect    ={handleSelect}
            onFilter    ={setFilter}
            onDeleteOne ={handleDeleteOne}
            unreadCount ={unreadCount}
            deleting    ={deleting}
          />
        </div>

        {/* Message detail */}
        <div className={`${showDetail ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 h-full`}>
          <MessageDetail
            message          ={selectedMsg}
            onStatusChange   ={(id, status) => setStatus(id, status)}
            onDelete         ={handleDeleteOne}
            onSendReply      ={(id, text)   => sendReply(id, text)}
            onSendNotification={(id, title, content) => sendNotif(id, title, content)}
            sendingReply     ={sendingReply}
            sendingNotif     ={sendingNotif}
            deleting         ={deleting}
            onBack           ={() => setShowDetail(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default IssuesPage;