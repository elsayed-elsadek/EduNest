



import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import DashLayout from '../../../components/layout/Dash-layout';
import SettingItem from '../../../components/mentor-components/mentor-setting-com/SettingItem';
import { Mail, Lock, Trash2, Edit2, X, Eye, EyeOff } from 'lucide-react';
import { useMentorSettings } from '../../../hooks/Usementorsettings';
import { useAuthStore } from '../../../store/authStore';


//  Modal wrapper
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

//  Input field
interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  showToggle?: boolean;
  autoComplete?: string;
}
const Input: FC<InputProps> = ({ label, value, onChange, type = 'text', placeholder, showToggle, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
        />
        {showToggle && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {show ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

//Settings Page
const Settings: FC = () => {
  const userEmail = useAuthStore((s) => s.userEmail);
  const navigate = useNavigate();
  const {
    loading, error, success,
    handleRequestEmailChange,
    handleConfirmEmailChange,
    handleChangePassword,
    handleDeactivate,
    handleRequestDelete,
    handleConfirmDelete,
  } = useMentorSettings();

  // modal states
  const [modal, setModal] = useState<'email' | 'email-otp' | 'password' | 'deactivate' | 'delete' | 'otp' | null>(null);


  // form values
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [deactivatePassword, setDeactivatePassword] = useState('');

  const closeModal = () => {
    setModal(null);
    setNewEmail(''); setEmailOtp(''); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setOtp(''); setDeactivatePassword('');
  };

  //  Submit handlers 
  const submitEmail = async () => {
    const ok = await handleRequestEmailChange({ newEmail });
    if (ok) { setModal('email-otp'); setEmailOtp(''); }
  };

  const submitConfirmEmail = async () => {
    await handleConfirmEmailChange(emailOtp); // logs out on success
  };

  const submitPassword = async () => {
    const ok = await handleChangePassword({ oldPassword, newPassword, confirmPassword });
    if (ok) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      closeModal();
    }
  };

  const submitDeactivate = async () => {
    const ok = await handleDeactivate(deactivatePassword);
    if (ok) navigate('/login', { replace: true });
  };

  const submitRequestDelete = async () => {
    const ok = await handleRequestDelete();
    if (ok) { setModal('otp'); setOtp(''); }
  };

  const submitConfirmDelete = async () => {
    await handleConfirmDelete(otp); // logs out on success
  };

  return (
    <DashLayout pageTitle="Settings">
      <div className="bg-[#F7F8FA] min-h-screen py-4 px-3 md:py-6 md:px-12">
        <div className="max-w-[1400px] mx-auto bg-white rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-4 py-4 md:px-8 md:py-6 flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-[#1A1C1E] dark:text-white">Account Setting</h1>
            <div className="flex gap-2">
              {success && <span className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-xl">{success}</span>}
              {error && <span className="text-sm font-semibold text-red-600   bg-red-50   px-4 py-2 rounded-xl">{error}</span>}
            </div>
          </div>

          <div className="p-4 md:p-12">
            <div className="max-w-5xl space-y-4">

              {/* Email */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 hover:bg-gray-50/50 transition-colors">
                <SettingItem
                  label="Email address"
                  description="The email address associated with your account"
                  value={userEmail}
                  icon={<Mail className="w-5 h-5" />}
                  actionButton={
                    <button onClick={() => { setNewEmail(userEmail); setModal('email'); }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                      <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-[#33A1E0]" />
                    </button>
                  }
                />
              </div>

              {/* Password */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 hover:bg-gray-50/50 transition-colors">
                <SettingItem
                  label="Password"
                  description="Set a unique password to protect your account"
                  value=""
                  icon={<Lock className="w-5 h-5" />}
                  actionButton={
                  <button onClick={() => { setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setModal('password'); }}
                      className="whitespace-nowrap px-4 py-2 text-[12px] md:text-sm font-bold text-[#33A1E0] border border-blue-100 rounded-xl hover:bg-[#33A1E0] hover:text-white transition-all">
                      Change Password
                    </button>
                  }
                />
              </div>

              {/* Deactivate */}
              <div className="bg-yellow-50/40 rounded-2xl border border-yellow-100 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="p-3 bg-yellow-50 rounded-2xl flex-shrink-0">
                      <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Deactivate Account</h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-md leading-relaxed">
                        Temporarily disable your account. You can reactivate anytime by logging in again.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setModal('deactivate')}
                    className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-yellow-600 border border-yellow-200 rounded-2xl hover:bg-yellow-600 hover:text-white transition-all text-center">
                    Deactivate
                  </button>
                </div>
              </div>

              {/* Delete */}
              <div className="bg-red-50/30 rounded-2xl border border-red-100 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="p-3 bg-red-50 rounded-2xl flex-shrink-0">
                      <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Delete Account</h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-md leading-relaxed">
                        This will permanently delete your account from EduNest.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setModal('delete')}
                    className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-red-500 border border-red-200 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-center">
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Change Email — Step 1 ── */}
      {modal === 'email' && (
        <Modal title="Change Email Address" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Enter your new email. We'll send an OTP to verify it.</p>
            <Input label="New Email" value={newEmail} onChange={setNewEmail} type="email" placeholder="new@email.com" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={submitEmail} disabled={loading || !newEmail}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Change Email — Step 2 (OTP) ── */}
      {modal === 'email-otp' && (
        <Modal title="Confirm New Email" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Enter the OTP sent to <span className="font-semibold text-gray-800">{newEmail}</span>
            </p>
            <input
              type="text"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 text-center">You'll be logged out after email change</p>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={submitConfirmEmail} disabled={loading || emailOtp.length < 4}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50">
                {loading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Change Password ── */}
      {modal === 'password' && (
        <Modal title="Change Password" onClose={closeModal}>
          <form autoComplete="off" className="space-y-4">
            <Input label="Current Password" value={oldPassword} onChange={setOldPassword} showToggle autoComplete="current-password" />
            <Input label="New Password" value={newPassword} onChange={setNewPassword} showToggle autoComplete="new-password" />
            <Input label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} showToggle autoComplete="new-password" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button type="button" onClick={submitPassword} disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50">
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Deactivate ── */}
      {modal === 'deactivate' && (
        <Modal title="Deactivate Account" onClose={closeModal}>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500 text-center">Enter your password to temporarily disable your account.</p>
            <Input label="Password" value={deactivatePassword} onChange={setDeactivatePassword} showToggle />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={submitDeactivate} disabled={loading || !deactivatePassword}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-white text-sm font-semibold disabled:opacity-50">
                {loading ? 'Processing...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Delete (step 1 — confirm intent) ── */}
      {modal === 'delete' && (
        <Modal title="Delete Account" onClose={closeModal}>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-sm text-gray-500">
              We'll send an OTP to <span className="font-semibold text-gray-800">{userEmail}</span> to confirm deletion.
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={submitRequestDelete} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: OTP (step 2 — confirm delete) ── */}
      {modal === 'otp' && (
        <Modal title="Confirm Deletion" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Enter the OTP sent to <span className="font-semibold text-gray-800">{userEmail}</span>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={submitConfirmDelete} disabled={loading || otp.length < 4}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50">
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </DashLayout>
  );
};

export default Settings;

