import type { ProfileData } from '../../../../types/student-role-types/profile.types';

export interface ProfileHeaderProps {
  profile:      ProfileData;
  onEditProfile: () => void;
}