
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
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
  const [success, setSuccess] = useState<string | null>(null);

  const clear = () => { setError(null); setSuccess(null); };

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const extractError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'Something went wrong';
    const e = err as Record<string, unknown>;
    if (e.errorMessages && typeof e.errorMessages === 'object') {
      const first = Object.values(e.errorMessages as Record<string, unknown>)[0];
      if (typeof first === 'string') return first;
    }
    if (typeof e.message === 'string') return e.message;
    return 'Something went wrong';
  };

  const handleRequestEmailChange = async (data: ChangeEmailRequest) => {
    clear(); setLoading(true);
    try {
      await requestEmailChange(data);
      flash(`OTP sent to ${data.newEmail}`);
      return true;
    } catch (err) { setError(extractError(err)); return false; }
    finally { setLoading(false); }
  };

  const handleConfirmEmailChange = async (otpCode: string) => {
    clear(); setLoading(true);
    try {
      await confirmEmailChange({ otpCode });
      logout();
      return true;
    } catch (err) { setError(extractError(err)); return false; }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    clear(); setLoading(true);
    try {
      await changePassword(data);
      flash('Password changed successfully!');
      return true;
    } catch (err) { setError(extractError(err)); return false; }
    finally { setLoading(false); }
  };

  const handleDeactivate = async (password: string) => {
    clear(); setLoading(true);
    try {
      await deactivateAccount(password);
      logout();
      return true;
    } catch (err) { setError(extractError(err)); return false; }
    finally { setLoading(false); }
  };

  const handleRequestDelete = async () => {
    clear(); setLoading(true);
    try {
      await requestDeleteAccount();
      flash(`OTP sent to ${userEmail}`);
      return true;
    } catch (err) { setError(extractError(err)); return false; }
    finally { setLoading(false); }
  };

  const handleConfirmDelete = async (otp: string) => {
    clear(); setLoading(true);
    try {
      await confirmDeleteAccount({ otp });
      logout();
      return true;
    } catch (err) { setError(extractError(err)); return false; }
    finally { setLoading(false); }
  };

  return {
    loading, error, success,
    handleRequestEmailChange,
    handleConfirmEmailChange,
    handleChangePassword,
    handleDeactivate,
    handleRequestDelete,
    handleConfirmDelete,
  };
};