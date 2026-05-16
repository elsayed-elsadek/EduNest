import { type FC, useState } from 'react';
import { X } from 'lucide-react';
import type { NotificationFormData, NotifType } from '../../../types/admin-role-types/issues.types';

interface SendNotificationModalProps {
  defaultEmail : string;
  onClose      : () => void;
  onSend       : (data: NotificationFormData) => void;
}

const NOTIF_TYPES: NotifType[] = ['Info', 'Warning', 'Success', 'Error'];

const SendNotificationModal: FC<SendNotificationModalProps> = ({
  defaultEmail,
  onClose,
  onSend,
}) => {
  const [form, setForm] = useState<NotificationFormData>({
    email  : defaultEmail,
    title  : '',
    type   : 'Info',
    content: '',
  });

  const set = <K extends keyof NotificationFormData>(key: K, val: NotificationFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSend = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    onSend(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-gray-900">Send Notification</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center
                       text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 tracking-widest mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13.5px]
                         text-gray-900 outline-none focus:border-[#0f5e8b] transition-colors"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 tracking-widest mb-1.5">
              NOTIFICATION TITLE
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13.5px]
                         text-gray-900 placeholder:text-gray-300 outline-none
                         focus:border-[#0f5e8b] transition-colors"
              placeholder="e.g. Payment Update"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 tracking-widest mb-1.5">
              NOTIFICATION TYPE
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13.5px]
                         text-gray-900 outline-none focus:border-[#0f5e8b] transition-colors bg-white"
              value={form.type}
              onChange={e => set('type', e.target.value as NotifType)}
            >
              {NOTIF_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 tracking-widest mb-1.5">
              CONTENT
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13.5px]
                         text-gray-900 placeholder:text-gray-300 outline-none resize-none
                         focus:border-[#0f5e8b] transition-colors"
              placeholder="Type notification content..."
              value={form.content}
              onChange={e => set('content', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px]
                       font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!form.title.trim() || !form.content.trim()}
            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white
                       transition-colors disabled:opacity-50"
            style={{ background: '#0f5e8b' }}
          >
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendNotificationModal;