
import { type FC, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import ProfileCard        from '../../../components/admin-components/configration-com/ProfileCard';
import AccountSecurity    from '../../../components/admin-components/configration-com/AccountSecurity';
import EmailSettings      from '../../../components/admin-components/configration-com/EmailSettings';
import CommissionSettings from '../../../components/admin-components/configration-com/CommissionSettings';
import {
  EditProfileModal,
  ChangePasswordModal,
  ChangeEmailModal,
} from '../../../components/admin-components/configration-com/adminmodal';
import { useAdminSettings } from '../../../hooks/admin-roleHooks/Useadminsettings';

// Modal state 
type ModalKey = 'editProfile' | 'changePassword' | 'changeEmail' | null;

const AdminSettings: FC = () => {
  const {
    profile,
    commissionRate,
    loadingProfile,
    loadingCommission,
    saveProfile,
    uploadImage,
    requestEmail,
    confirmEmail,
    savePassword,
    saveCommission,
    savingProfile,
    uploadingImage,
    requestingEmail,
    confirmingEmail,
    savingPassword,
    savingCommission,
  } = useAdminSettings();

  const [modal,     setModal    ] = useState<ModalKey>(null);
  const [emailStep, setEmailStep] = useState<'request' | 'confirm'>('request');

  const closeModal = () => setModal(null);

  //  Loading state 
  if (loadingProfile || loadingCommission) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading settings…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-sm text-gray-400">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 bg-white rounded-lg shadow-sm p-6">

        {/* Page Header */}
        <div className="mb-2">
          <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900">
            Settings &amp; Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your administrative identity and security preferences.
          </p>
        </div>

        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          onEditProfile={() => setModal('editProfile')}
        />

        {/* Account Security */}
        <AccountSecurity
          lastChanged="Last changed recently"
          onRequestChangePassword={() => setModal('changePassword')}
          loading={savingPassword}
        />

        {/* Email Settings */}
        <EmailSettings
          currentEmail={profile.email}
          onRequestChangeEmail={() => {
            setEmailStep('request');
            setModal('changeEmail');
          }}
          loading={requestingEmail || confirmingEmail}
        />

        {/* Commission Settings */}
        <CommissionSettings
          platformFee={commissionRate}
          onEdit={() => {}}
          onSave={(fee) => saveCommission(fee)}
          onViewFeeHistory={() => {}}
          loading={savingCommission}
        />
      </div>

      {/*  Modals  */}

      {/* Edit Profile */}
      <EditProfileModal
        open={modal === 'editProfile'}
        profile={profile}
        saving={savingProfile || uploadingImage}
        onClose={closeModal}
        onSave={(data) => {
          saveProfile(data);
          closeModal();
        }}
        onImageChange={(file) => uploadImage(file)}
      />

      {/* Change Password */}
      <ChangePasswordModal
        open={modal === 'changePassword'}
        saving={savingPassword}
        onClose={closeModal}
        onSave={(data) => {
          savePassword(data);
          closeModal();
        }}
      />

      {/* Change Email — 2-step */}
      <ChangeEmailModal
        open={modal === 'changeEmail'}
        currentEmail={profile.email}
        saving={requestingEmail || confirmingEmail}
        step={emailStep}
        onClose={closeModal}
        onRequest={(newEmail) => {
          requestEmail(newEmail);
          setEmailStep('confirm');   
        }}
        onConfirm={(otp) => {
          confirmEmail(otp);
          closeModal();
          setEmailStep('request'); 
        }}
      />
    </div>
  );
};

export default AdminSettings;