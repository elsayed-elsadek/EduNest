
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
import { getAssetUrl } from '../../config/env';

function buildUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return getAssetUrl(path);
}

// Helper: Extract error message from Axios error response safely
const extractErrorMessage = (err: unknown): string => {
  if (!err || typeof err !== 'object') {
    // Handle string errors directly
    if (typeof err === 'string') {
      return err;
    }
    return 'An error occurred';
  }

  const error = err as Record<string, unknown>;

  // First check if it's already the response data (from service error handling)
  // Check errorMessages.error from backend
  if (error.errorMessages && typeof error.errorMessages === 'object') {
    const msgs = error.errorMessages as Record<string, unknown>;
    if (typeof msgs.error === 'string') {
      return msgs.error;
    }
  }
  
  // Check apiResponse.message
  if (error.apiResponse && typeof error.apiResponse === 'object') {
    const apiResp = error.apiResponse as Record<string, unknown>;
    if (typeof apiResp.message === 'string') {
      return apiResp.message;
    }
  }

  // Try Axios error structure: error.response.data
  if (error.response && typeof error.response === 'object') {
    const response = error.response as Record<string, unknown>;
    const data = response.data;
    
    if (data && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>;
      
      // Check errorMessages.error from backend
      if (dataObj.errorMessages && typeof dataObj.errorMessages === 'object') {
        const msgs = dataObj.errorMessages as Record<string, unknown>;
        if (typeof msgs.error === 'string') {
          return msgs.error;
        }
      }
      
      // Check apiResponse.message
      if (dataObj.apiResponse && typeof dataObj.apiResponse === 'object') {
        const apiResp = dataObj.apiResponse as Record<string, unknown>;
        if (typeof apiResp.message === 'string') {
          return apiResp.message;
        }
      }
    }
    
    // Check HTTP status code
    if (typeof response.status === 'number') {
      return `Request failed with status code ${response.status}`;
    }
  }

  // Fallback to error.message
  if (typeof error.message === 'string') {
    return error.message;
  }

  return 'An error occurred';
};

// Helper: Extract success message from response
const extractSuccessMessage = (data: unknown, fallback: string): string => {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const resp = data as Record<string, unknown>;

  // Check apiResponse.message
  if (resp.apiResponse && typeof resp.apiResponse === 'object') {
    const apiResp = resp.apiResponse as Record<string, unknown>;
    if (typeof apiResp.message === 'string') {
      return apiResp.message;
    }
    if (typeof apiResp.Status === 'string') {
      return apiResp.Status;
    }
  }

  return fallback;
};

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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ADMIN_PROFILE_KEY });
      const message = extractSuccessMessage(data, 'Profile updated successfully');
      toast.success(message);
    },
    onError: (err) => {
      const message = extractErrorMessage(err);
      toast.error(message);
    },
  });

  //  Update image 
  const updateImageM = useMutation({
    mutationFn: updateAdminImage,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ADMIN_PROFILE_KEY });
      updateStore({ userAvatar: undefined }); 
      const message = extractSuccessMessage(data, 'Profile image updated successfully');
      toast.success(message);
    },
    onError: (err) => {
      const message = extractErrorMessage(err);
      toast.error(message);
    },
  });

  //  Request email change
  const requestEmailM = useMutation({
    mutationFn: (newEmail: string) => requestEmailChange(newEmail),
    onSuccess: (data) => {
      const message = extractSuccessMessage(data, 'OTP sent to your email');
      toast.success(message);
    },
    onError: (err) => {
      const message = extractErrorMessage(err);
      toast.error(message);
    },
  });

  //  Confirm email change
  const confirmEmailM = useMutation({
    mutationFn: (otpCode: string) => confirmEmailChange(otpCode),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ADMIN_PROFILE_KEY });
      const message = extractSuccessMessage(data, 'Email changed successfully');
      toast.success(message);
    },
    onError: (err) => {
      const message = extractErrorMessage(err);
      toast.error(message);
    },
  });

  //  Change password
  const changePasswordM = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      const message = extractSuccessMessage(data, 'Password changed successfully');
      toast.success(message);
    },
    onError: (err) => {
      const message = extractErrorMessage(err);
      toast.error(message);
    },
  });

  // Commission update
  const updateCommissionM = useMutation({
    mutationFn: (rate: number) => updateCommission(rate),
    onSuccess: (data, rate) => {
      qc.setQueryData(ADMIN_COMMISSION_KEY, { apiResponse: { commissionRate: rate } });
      const message = extractSuccessMessage(data, `Commission updated to ${rate}%`);
      toast.success(message);
    },
    onError: (err) => {
      const message = extractErrorMessage(err);
      toast.error(message);
    },
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