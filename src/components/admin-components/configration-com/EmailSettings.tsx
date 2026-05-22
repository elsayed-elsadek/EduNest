import type { FC } from 'react';
import { Mail, RefreshCw, AtSign } from 'lucide-react';
import type { EmailSettingsProps } from '../../../types/admin-role-types/adminConfigrations.types';

const EmailSettings: FC<EmailSettingsProps> = ({
  currentEmail,
  onRequestChangeEmail,
  loading,
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">

    {/* Section Header */}
    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
      <Mail className="w-5 h-5 text-[#0f5e8b]" />
      <h3 className="text-base font-bold text-gray-900">Email Settings</h3>
    </div>

    {/* Email Row */}
    <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
      <div className="flex-1 min-w-0">
        <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">
          Current Primary Email
        </label>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl w-full sm:max-w-xs">
          <AtSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate">{currentEmail}</span>
        </div>
      </div>

      <button
        onClick={onRequestChangeEmail}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0f5e8b] text-white text-sm font-semibold rounded-xl hover:bg-[#0a4a6e] transition-colors disabled:opacity-60 whitespace-nowrap self-start sm:self-auto"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Request Change Email
      </button>
    </div>
  </div>
);

export default EmailSettings;