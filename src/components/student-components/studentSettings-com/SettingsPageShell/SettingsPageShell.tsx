
import type { FC } from 'react';
import { X } from 'lucide-react';
import type { SettingsPageShellProps } from './SettingsPageShell.types';

// ── Reusable Modal ──────────────────────────────────────────────────
export const SettingsModal: FC<SettingsPageShellProps> = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ── Reusable Password Input ─────────────────────────────────────────
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ModalInputProps {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  type?:       string;
  placeholder?: string;
  showToggle?: boolean;
  readOnly?:   boolean;
}

export const ModalInput: FC<ModalInputProps> = ({
  label, value, onChange, type = 'text', placeholder, showToggle, readOnly,
}) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`
            w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2
            focus:ring-[#0c2d48]/30 pr-10 transition-colors
            ${readOnly
              ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed'
              : 'border-gray-200 bg-white'
            }
          `}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

// ── OTP Input ───────────────────────────────────────────────────────
interface OtpInputProps {
  value:    string;
  onChange: (v: string) => void;
  color?:   'blue' | 'red';
}

export const OtpInput: FC<OtpInputProps> = ({ value, onChange, color = 'blue' }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Enter OTP"
    maxLength={6}
    className={`
      w-full px-4 py-3 border border-gray-200 rounded-xl text-center
      text-xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2
      ${color === 'blue' ? 'focus:ring-blue-400' : 'focus:ring-red-400'}
    `}
  />
);

// ── Modal Action Buttons ────────────────────────────────────────────
interface ModalActionsProps {
  onCancel:       () => void;
  onConfirm:      () => void;
  confirmLabel:   string;
  loading:        boolean;
  disabled:       boolean;
  confirmVariant?: 'primary' | 'yellow' | 'red';
}

export const ModalActions: FC<ModalActionsProps> = ({
  onCancel, onConfirm, confirmLabel, loading, disabled, confirmVariant = 'primary',
}) => {
  const variantClass = {
    primary: 'bg-[#0c2d48] hover:bg-[#0a2438]',
    yellow:  'bg-yellow-500 hover:bg-yellow-600',
    red:     'bg-red-500 hover:bg-red-600',
  }[confirmVariant];

  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading || disabled}
        className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${variantClass}`}
      >
        {loading ? 'Processing...' : confirmLabel}
      </button>
    </div>
  );
};