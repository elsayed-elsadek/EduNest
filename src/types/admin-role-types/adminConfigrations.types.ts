export interface AdminProfile {
  name:     string;
  email:    string;
  role:     string;
  status:   'ACTIVE' | 'INACTIVE';
  avatar?:  string;
  headline?: string;
  firstName?: string;
  lastName?:  string;
}

export interface ProfileCardProps {
  profile:       AdminProfile;
  onEditProfile: () => void;
}

export interface AccountSecurityProps {
  lastChanged:             string;
  onRequestChangePassword: () => void;
  loading?:                boolean;
}

export interface EmailSettingsProps {
  currentEmail:         string;
  onRequestChangeEmail: () => void;
  loading?:             boolean;
}

export interface CommissionSettingsProps {
  platformFee:      number;
  onEdit:           () => void;
  onSave:           (fee: number) => void;
  onViewFeeHistory: () => void;
  loading?:         boolean;
}

export interface AdminSettingsPageData {
  profile:     AdminProfile;
  lastChanged: string;
  platformFee: number;
}

// ── Modal props 
export interface EditProfileModalProps {
  open:        boolean;
  profile:     AdminProfile;
  saving:      boolean;
  onClose:     () => void;
  onSave:      (data: { firstName: string; lastName: string; headline: string }) => void;
  onImageChange?: (file: File) => void;
}

export interface ChangePasswordModalProps {
  open:    boolean;
  saving:  boolean;
  onClose: () => void;
  onSave:  (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => void;
}

export interface ChangeEmailModalProps {
  open:         boolean;
  currentEmail: string;
  saving:       boolean;
  onClose:      () => void;
  onRequest:    (newEmail: string) => void;
  onConfirm:    (otpCode: string) => void;
  step:         'request' | 'confirm';
}