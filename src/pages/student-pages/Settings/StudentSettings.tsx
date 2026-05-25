
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Pause, Trash, AlertTriangle } from 'lucide-react';
import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import SectionHeading from '../../../components/student-components/studentSettings-com/SectionHeading/SectionHeading';
import CredentialCard from '../../../components/student-components/studentSettings-com/CredentialCard/CredentialCard';
import SensitiveActionCard from '../../../components/student-components/studentSettings-com/SensitiveActionCard/SensitiveActionCard';
import {
  SettingsModal,
  ModalInput,
  OtpInput,
  ModalActions,
} from '../../../components/student-components/studentSettings-com/SettingsPageShell/SettingsPageShell';
import { useStudentSettings } from '../../../hooks/student-roleHooks/useStudentSettings';
import { useAuthStore } from '../../../store/authStore';

type ModalType =
  | 'email'
  | 'email-otp'
  | 'password'
  | 'deactivate'
  | 'delete'
  | 'delete-otp'
  | null;

const StudentSettings: FC = () => {
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
  } = useStudentSettings();

  const [modal, setModal] = useState<ModalType>(null);

  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deactivatePassword, setDeactivatePassword] = useState('');

  const closeModal = () => {
    setModal(null);
    setNewEmail(''); setEmailOtp('');
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    setDeleteOtp(''); setDeactivatePassword('');
  };

  const submitEmail = async () => {
    const ok = await handleRequestEmailChange({ newEmail });
    if (ok) { setModal('email-otp'); setEmailOtp(''); }
  };

  const submitConfirmEmail = async () => {
    await handleConfirmEmailChange(emailOtp);
  };

  const submitPassword = async () => {
    const ok = await handleChangePassword({ oldPassword, newPassword, confirmPassword });
    if (ok) closeModal();
  };

  const submitDeactivate = async () => {
    const ok = await handleDeactivate(deactivatePassword);
    if (ok) navigate('/login', { replace: true });
  };

  const submitRequestDelete = async () => {
    const ok = await handleRequestDelete();
    if (ok) { setModal('delete-otp'); setDeleteOtp(''); }
  };

  const submitConfirmDelete = async () => {
    await handleConfirmDelete(deleteOtp);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Frame Container ── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {/* ── Frame Header ── */}
          <div className="bg-[#0c2d48] px-7 py-5">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">
              Student Portal
            </p>
            <h1 className="text-xl font-bold text-white">Account Management</h1>
            <p className="text-xs text-white/55 mt-1">
              Refine your institutional credentials and administrative preferences.
            </p>
          </div>

          {/* ── Content ── */}
          <div className="px-7 py-6 space-y-6">

            {/* Toast Messages */}
            {(success || error) && (
              <div className={`px-4 py-3 rounded-xl text-sm font-semibold text-center ${
                success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {success || error}
              </div>
            )}

            {/* ── Primary Credentials ── */}
            <div className="space-y-3">
              <SectionHeading label="Primary Credentials" />
              <CredentialCard
                iconBg="bg-blue-100"
                icon={<Mail className="w-5 h-5 text-[#0c2d48]" />}
                tagLabel="Institutional Email"
                mainValue={userEmail ?? 'user@email.edu'}
                description="Used for official communications and course updates."
                actionLabel="Request Email Change"
                onAction={() => { setNewEmail(userEmail ?? ''); setModal('email'); }}
              />
            </div>

            {/* ── Security Protocols ── */}
            <div className="space-y-3">
              <SectionHeading label="Security Protocols" />
              <CredentialCard
                iconBg="bg-blue-100"
                icon={<Lock className="w-5 h-5 text-[#0c2d48]" />}
                tagLabel="Master Password"
                mainValue="••••••••••"
                description="Last updated 45 days ago. We recommend regular rotation."
                actionLabel="Request Password Reset"
                onAction={() => setModal('password')}
              />
            </div>

            {/* ── Sensitive Actions ── */}
            <div className="space-y-3">
              <SectionHeading label="Sensitive Actions" variant="danger" />
              <SensitiveActionCard
                variant="deactivate"
                title="Deactivate Account"
                description={
                  <span className="text-yellow-600">
                    Temporarily suspend your academic profile. Your data remains stored and you
                    can reactivate at any time.
                  </span>
                }
                actionLabel="Request Deactivation"
                onAction={() => setModal('deactivate')}
              />
              <SensitiveActionCard
                variant="delete"
                title="Delete Account Permanently"
                description={
                  <>
                    Purge all academic records.{' '}
                    <span className="font-semibold text-red-500">This action is irreversible</span>
                    {' '}and requires administrative approval.
                  </>
                }
                actionLabel="Request Deletion"
                onAction={() => setModal('delete')}
              />
            </div>

          </div>
        </div>
      </main>


      {/* ════ MODALS ════ */}

      {modal === 'email' && (
        <SettingsModal title="Request Email Change" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Enter your new institutional email. We'll send an OTP to verify it.
            </p>
            <ModalInput
              label="New Email"
              value={newEmail}
              onChange={setNewEmail}
              type="email"
              placeholder="new@institution.edu"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <ModalActions
              onCancel={closeModal}
              onConfirm={submitEmail}
              confirmLabel="Send OTP"
              loading={loading}
              disabled={!newEmail}
            />
          </div>
        </SettingsModal>
      )}

      {modal === 'email-otp' && (
        <SettingsModal title="Confirm New Email" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Enter the OTP sent to{' '}
              <span className="font-semibold text-gray-800">{newEmail}</span>
            </p>
            <OtpInput value={emailOtp} onChange={setEmailOtp} color="blue" />
            <p className="text-xs text-gray-400 text-center">
              You'll be logged out after the email change.
            </p>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <ModalActions
              onCancel={closeModal}
              onConfirm={submitConfirmEmail}
              confirmLabel="Confirm"
              loading={loading}
              disabled={emailOtp.length < 4}
            />
          </div>
        </SettingsModal>
      )}

      {modal === 'password' && (
        <SettingsModal title="Reset Master Password" onClose={closeModal}>
          <div className="space-y-4">
            <ModalInput label="Current Password" value={oldPassword} onChange={setOldPassword} showToggle />
            <ModalInput label="New Password" value={newPassword} onChange={setNewPassword} showToggle />
            <ModalInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} showToggle />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <ModalActions
              onCancel={closeModal}
              onConfirm={submitPassword}
              confirmLabel="Save Changes"
              loading={loading}
              disabled={!oldPassword || !newPassword || !confirmPassword}
            />
          </div>
        </SettingsModal>
      )}

      {modal === 'deactivate' && (
        <SettingsModal title="Request Deactivation" onClose={closeModal}>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto">
              <Pause className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Confirm your password to temporarily suspend your account.
            </p>
            <ModalInput
              label="Password"
              type="password"
              value={deactivatePassword}
              onChange={setDeactivatePassword}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <ModalActions
              onCancel={closeModal}
              onConfirm={submitDeactivate}
              confirmLabel="Deactivate"
              loading={loading}
              disabled={!deactivatePassword}
              confirmVariant="yellow"
            />
          </div>
        </SettingsModal>
      )}

      {modal === 'delete' && (
        <SettingsModal title="Request Deletion" onClose={closeModal}>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <Trash className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-gray-500">
              We'll send an OTP to{' '}
              <span className="font-semibold text-gray-800">{userEmail}</span>{' '}
              to confirm permanent deletion.
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <ModalActions
              onCancel={closeModal}
              onConfirm={submitRequestDelete}
              confirmLabel="Send OTP"
              loading={loading}
              disabled={false}
              confirmVariant="red"
            />
          </div>
        </SettingsModal>
      )}

      {modal === 'delete-otp' && (
        <SettingsModal title="Confirm Deletion" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Enter the OTP sent to{' '}
              <span className="font-semibold text-gray-800">{userEmail}</span>
            </p>
            <OtpInput value={deleteOtp} onChange={setDeleteOtp} color="red" />
            <p className="text-xs text-red-400 text-center font-medium inline-flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>This action cannot be undone.</span>
            </p>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <ModalActions
              onCancel={closeModal}
              onConfirm={submitConfirmDelete}
              confirmLabel="Confirm Deletion"
              loading={loading}
              disabled={deleteOtp.length < 4}
              confirmVariant="red"
            />
          </div>
        </SettingsModal>
      )}
    </div>
  );
};

export default StudentSettings;