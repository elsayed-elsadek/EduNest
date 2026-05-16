
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminImage,
  requestEmailChange,
  confirmEmailChange,
  changePassword,
  getCommission,
  updateCommission,
} from '../../services/admin-role-service/Adminsettingsservice';
import type { AdminProfile } from '../../types/admin-role-types/adminConfigrations.types';
import api from '../../services/api';

const BASE_URL = (api.defaults.baseURL ?? '')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

function buildUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

// Query keys 
export const ADMIN_PROFILE_KEY  = ['admin-profile']  as const;
export const ADMIN_COMMISSION_KEY = ['admin-commission'] as const;

//  Hook 
export const useAdminSettings = () => {
  const qc          = useQueryClient();
  const updateStore = useAuthStore(s => s.updateProfile);

  // Profile fetch
  const profileQ = useQuery({
    queryKey:  ADMIN_PROFILE_KEY,
    queryFn:   getAdminProfile,
    staleTime: 5 * 60 * 1000,
    gcTime:    15 * 60 * 1000,
    select: (res): AdminProfile => {
      const p = res.apiResponse.profile;
      return {
        name:      p.fullName,
        firstName: p.firstName,
        lastName:  p.lastName,
        email:     p.email,
        role:      'System Admin',
        status:    'ACTIVE',
        avatar:    buildUrl(p.profileImageUrl),
        headline:  p.headline ?? '',
      };
    },
  });

  //  Commission fetch 
  const commissionQ = useQuery({
    queryKey:  ADMIN_COMMISSION_KEY,
    queryFn:   getCommission,
    staleTime: 5 * 60 * 1000,
    select:    (res) => res.apiResponse.commissionRate,
  });

  //  Update profile 
  const updateProfileM = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_PROFILE_KEY });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  //  Update image 
  const updateImageM = useMutation({
    mutationFn: updateAdminImage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_PROFILE_KEY });
      updateStore({ userAvatar: undefined }); 
      toast.success('Profile image updated');
    },
    onError: () => toast.error('Failed to update image'),
  });

  //  Request email change
  const requestEmailM = useMutation({
    mutationFn: (newEmail: string) => requestEmailChange(newEmail),
    onSuccess:  () => toast.success('OTP sent to new email'),
    onError:    () => toast.error('Failed to request email change'),
  });

  //  Confirm email change
  const confirmEmailM = useMutation({
    mutationFn: (otpCode: string) => confirmEmailChange(otpCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_PROFILE_KEY });
      toast.success('Email changed successfully — please log in again');
    },
    onError: () => toast.error('Invalid OTP'),
  });

  //  Change password
  const changePasswordM = useMutation({
    mutationFn: changePassword,
    onSuccess:  () => toast.success('Password changed'),
    onError:    () => toast.error('Failed to change password'),
  });

  // Commission update
  const updateCommissionM = useMutation({
    mutationFn: (rate: number) => updateCommission(rate),
    onSuccess: (_, rate) => {
      qc.setQueryData(ADMIN_COMMISSION_KEY, { apiResponse: { commissionRate: rate } });
      toast.success(`Commission updated to ${rate}%`);
    },
    onError: () => toast.error('Failed to update commission'),
  });

  return {
    // data
    profile:        profileQ.data,
    commissionRate: commissionQ.data ?? 0,
    loadingProfile: profileQ.isLoading,
    loadingCommission: commissionQ.isLoading,

    // mutations
    saveProfile:      (d: Parameters<typeof updateAdminProfile>[0]) => updateProfileM.mutate(d),
    uploadImage:      (f: File) => updateImageM.mutate(f),
    requestEmail:     (email: string) => requestEmailM.mutate(email),
    confirmEmail:     (otp: string)   => confirmEmailM.mutate(otp),
    savePassword:     (d: Parameters<typeof changePassword>[0]) => changePasswordM.mutate(d),
    saveCommission:   (rate: number)  => updateCommissionM.mutate(rate),

    // loading states
    savingProfile:    updateProfileM.isPending,
    uploadingImage:   updateImageM.isPending,
    requestingEmail:  requestEmailM.isPending,
    confirmingEmail:  confirmEmailM.isPending,
    savingPassword:   changePasswordM.isPending,
    savingCommission: updateCommissionM.isPending,
  };
};