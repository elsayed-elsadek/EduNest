import { type FC, useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import type { AdminMessage, MessageStatus } from '../../../types/admin-role-types/issues.types';
import StatusPill            from './StatusPill';
import SendNotificationModal from './SendNotificationModal';

interface MessageDetailProps {
  message             : AdminMessage | null;
  onStatusChange      : (id: number, status: MessageStatus) => void;
  onDelete?           : (id: number) => void;
  onSendReply?        : (id: number, text: string) => void;
  onSendNotification? : (id: number, title: string, content: string) => void;
  sendingReply?       : boolean;
  sendingNotif?       : boolean;
  deleting?          : boolean;
  onBack?             : () => void; 
}

const MessageDetail: FC<MessageDetailProps> = ({
  message,
  onStatusChange,
  onDelete,
  onSendReply,
  onSendNotification,
  sendingReply,
  sendingNotif,
  deleting,
  onBack,
}) => {
  const [reply, setReply] = useState('');
  const [modal, setModal] = useState(false);

  //  Null state 
  if (!message) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white
                      text-gray-400 gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
          💬
        </div>
        <p className="text-[14px] font-medium">Select an issue to view its details</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0 h-full overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3.5
                      border-b border-gray-100 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center
                         text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeft size={15} strokeWidth={1.7} />
            </button>
          )}

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white
                          text-[13px] font-bold shrink-0"
               style={{ background: '#0f5e8b' }}>
            {message.initials}
          </div>

          {/* Name + time */}
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">
              {message.name}
            </p>
            <p className="text-[11.5px] text-gray-400">{message.received}</p>
          </div>
        </div>

        {/* Status pill — interactive dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          {onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              disabled={deleting}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px]
                         font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors
                         disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}

          <StatusPill
            status={message.status}
            onChange={s => onStatusChange(message.id, s)}
            size="md"
          />
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-gray-100
                        rounded-xl bg-gray-50">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Email Address
            </p>
            <p className="text-[13px] text-gray-800 font-medium">{message.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Phone Number
            </p>
            <p className="text-[13px] text-gray-800 font-medium">{message.phone}</p>
          </div>
        </div>

        {/* Message body */}
        <div className="border border-gray-100 rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px]">💬</span>
            <span className="text-[13px] font-bold text-gray-900">Message Content</span>
          </div>
          <p className="text-[13.5px] text-gray-700 leading-relaxed whitespace-pre-line">
            {message.body}
          </p>
        </div>
      </div>

      {/* ── Reply area ── */}
      <div className="shrink-0 px-4 md:px-6 py-4 border-t border-gray-100">
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Write your reply here..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13.5px]
                     text-gray-700 placeholder:text-gray-300 outline-none resize-none
                     focus:border-[#0f5e8b] transition-colors mb-3"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center
                        justify-end gap-2.5">
          <button
            onClick={() => setModal(true)}
            disabled={sendingNotif}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200
                       rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50
                       transition-colors disabled:opacity-50"
          >
            {sendingNotif ? 'Preparing…' : '🔔 Send Notification'}
          </button>
          <button
            onClick={() => {
              if (!reply.trim()) return;
              onSendReply?.(message.id, reply.trim());
              setReply('');
            }}
            disabled={!reply.trim() || sendingReply}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                       text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: '#0f5e8b' }}
          >
            {sendingReply ? 'Sending…' : 'Send Email ➤'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <SendNotificationModal
          defaultEmail={message.email}
          onClose={() => setModal(false)}
          onSend={data => {
            if (onSendNotification) {
              onSendNotification(message.id, data.title, data.content);
            }
            setModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MessageDetail;