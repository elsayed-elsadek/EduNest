import type { ProfileData } from '../../../../types/student-role-types/profile.types';

export interface EditProfileModalProps {
  isOpen:   boolean;
  profile:  ProfileData;
  onClose:  () => void;
  onSave:   (updated: ProfileData) => void;
}