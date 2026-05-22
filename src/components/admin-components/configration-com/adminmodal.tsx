

import { type FC, useState, useEffect } from 'react';
import { X, Camera, Eye, EyeOff } from 'lucide-react';
import type {
  EditProfileModalProps,
  ChangePasswordModalProps,
  ChangeEmailModalProps,
} from '../../../types/admin-role-types/adminConfigrations.types';

//  shared label
const Label: FC<{ text: string }> = ({ text }) => (
  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">{text}</p>
);

const Input: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900
               placeholder:text-gray-300 outline-none focus:border-[#0f5e8b] focus:ring-2
               focus:ring-[#0f5e8b]/10 transition-colors"
  />
);

// Edit Profile Modal
export const EditProfileModal: FC<EditProfileModalProps> = ({
  open, profile, saving, onClose, onSave, onImageChange,
}) => {
  const [form, setForm] = useState({
    firstName: profile.firstName ?? '',
    lastName:  profile.lastName  ?? '',
    headline:  profile.headline  ?? '',
  });

  useEffect(() => {
    if (open) setForm({
      firstName: profile.firstName ?? '',
      lastName:  profile.lastName  ?? '',
      headline:  profile.headline  ?? '',
    });
  }, [open, profile]);

  if (!open) return null;

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImageChange?.(file);
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Avatar */}
          {onImageChange && (
            <div className="flex justify-center">
              <div className="relative cursor-pointer group" onClick={handleImageClick}>
                <div className="w-16 h-16 rounded-full bg-[#e8f3fa] flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[#0f5e8b]">
                      {(profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div><Label text="First Name" /><Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} /></div>
            <div><Label text="Last Name"  /><Input value={form.lastName}  onChange={e => setForm(p => ({ ...p, lastName:  e.target.value }))} /></div>
          </div>
          <div><Label text="Headline" /><Input value={form.headline} placeholder="e.g. System Administrator" onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} /></div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            style={{ background: '#0f5e8b' }}>
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

//  Change Password Modal
export const ChangePasswordModal: FC<ChangePasswordModalProps> = ({
  open, saving, onClose, onSave,
}) => {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });

  if (!open) return null;

  const mismatch = form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword;
  const canSave  = form.oldPassword && form.newPassword.length >= 8 && !mismatch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">Change Password</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"><X size={14} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {(['old','new','confirm'] as const).map((key) => {
            const labels = { old: 'Current Password', new: 'New Password (min 8 chars)', confirm: 'Confirm New Password' };
            const fields = { old: 'oldPassword', new: 'newPassword', confirm: 'confirmPassword' } as const;
            return (
              <div key={key}>
                <Label text={labels[key]} />
                <div className="relative">
                  <Input
                    type={show[key] ? 'text' : 'password'}
                    value={form[fields[key]]}
                    onChange={e => setForm(p => ({ ...p, [fields[key]]: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            );
          })}
          {mismatch && <p className="text-xs text-red-500">Passwords do not match</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!canSave || saving}
            className="px-5 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
            style={{ background: '#0f5e8b' }}>
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

//  Change Email Modal (2-step OTP)
export const ChangeEmailModal: FC<ChangeEmailModalProps> = ({
  open, currentEmail, saving, onClose, onRequest, onConfirm, step,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [otp,      setOtp]      = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">
            {step === 'request' ? 'Change Email' : 'Confirm Email Change'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"><X size={14} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === 'request' ? (
            <>
              <div>
                <Label text="Current Email" />
                <p className="text-sm text-gray-600 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">{currentEmail}</p>
              </div>
              <div>
                <Label text="New Email" />
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@example.com" />
              </div>
              <p className="text-xs text-gray-400">An OTP will be sent to the new email address.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">Enter the OTP sent to <strong>{newEmail || 'your new email'}</strong>.</p>
              <div>
                <Label text="OTP Code" />
                <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button
            onClick={() => step === 'request' ? onRequest(newEmail) : onConfirm(otp)}
            disabled={saving || (step === 'request' ? !newEmail.includes('@') : otp.length < 4)}
            className="px-5 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
            style={{ background: '#0f5e8b' }}>
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{step === 'request' ? 'Sending…' : 'Verifying…'}</> : step === 'request' ? 'Send OTP' : 'Verify & Change'}
          </button>
        </div>
      </div>
    </div>
  );
};