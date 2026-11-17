
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { parseApiError } from '../../services/errors';
import {
  requestEmailChange,
  confirmEmailChange,
  changePassword,
  deactivateAccount,
  requestDeleteAccount,
  confirmDeleteAccount,
} from '../../services/Mentorsettingsservice';
import type { ChangeEmailRequest, ChangePasswordRequest } from '../../types/mentor-settings.types';

export const useStudentSettings = () => {
  const logout    = useAuthStore((s) => s.logout);
  const userEmail = useAuthStore((s) => s.userEmail);

  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState<string | null>(null);

  const clear = () => { setError(null); };

  const flash = (msg: string) => {
    toast.success(msg);
  };

  // EF-2: single source of truth for error message extraction (unified
  // envelope first, legacy shapes as fallback — never a raw technical string).
  const extractError = (err: unknown): string => parseApiError(err).message;

  const handleRequestEmailChange = async (data: ChangeEmailRequest) => {
    clear(); setLoading(true);
    try {
      await requestEmailChange(data);
      flash(`OTP sent to ${data.newEmail}`);
      return true;
    } catch (err) { const e = extractError(err); setError(e); toast.error(e); return false; }
    finally { setLoading(false); }
  };

  const handleConfirmEmailChange = async (otpCode: string) => {
    clear(); setLoading(true);
    try {
      await confirmEmailChange({ otpCode });
      logout();
      return true;
    } catch (err) { const e = extractError(err); setError(e); toast.error(e); return false; }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    clear(); setLoading(true);
    try {
      await changePassword(data);
      flash('Password changed successfully!');
      return true;
    } catch (err) { const e = extractError(err); setError(e); toast.error(e); return false; }
    finally { setLoading(false); }
  };

  const handleDeactivate = async (password: string) => {
    clear(); setLoading(true);
    try {
      await deactivateAccount(password);
      logout();
      return true;
    } catch (err) { const e = extractError(err); setError(e); toast.error(e); return false; }
    finally { setLoading(false); }
  };

  const handleRequestDelete = async () => {
    clear(); setLoading(true);
    try {
      await requestDeleteAccount();
      flash(`OTP sent to ${userEmail}`);
      return true;
    } catch (err) { const e = extractError(err); setError(e); toast.error(e); return false; }
    finally { setLoading(false); }
  };

  const handleConfirmDelete = async (otp: string) => {
    clear(); setLoading(true);
    try {
      await confirmDeleteAccount({ otp });
      logout();
      return true;
    } catch (err) { const e = extractError(err); setError(e); toast.error(e); return false; }
    finally { setLoading(false); }
  };

  return {
    loading, error,
    clear,
    handleRequestEmailChange,
    handleConfirmEmailChange,
    handleChangePassword,
    handleDeactivate,
    handleRequestDelete,
    handleConfirmDelete,
  };
};