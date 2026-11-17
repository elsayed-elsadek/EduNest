
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  requestEmailChange,
  confirmEmailChange,
  changePassword,
  deactivateAccount,
  requestDeleteAccount,
  confirmDeleteAccount,
} from '../services/Mentorsettingsservice';
import type { ChangeEmailRequest, ChangePasswordRequest } from '../types/mentor-settings.types';
import { parseApiError } from '../services/errors';

export const useMentorSettings = () => {
  const logout  = useAuthStore((s) => s.logout);
  const userEmail = useAuthStore((s) => s.userEmail);

  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clear = () => { setError(null); setSuccess(null); };

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  // EF-2: single source of truth for error message extraction (unified
  // envelope first, legacy shapes as fallback — never a raw technical string).
  const extractError = (err: unknown): string => parseApiError(err).message;

  // ── Email Step 1: request change (sends OTP to newEmail) ──────────────────
  const handleRequestEmailChange = async (data: ChangeEmailRequest) => {
    clear(); setLoading(true);
    try {
      await requestEmailChange(data);
      flash(`OTP sent to ${data.newEmail}`);
      return true;
    } catch (err: unknown) {
      setError(extractError(err));
      return false;
    } finally { setLoading(false); }
  };

  // ── Email Step 2: confirm with OTP (forces logout after) ─────────────────
  const handleConfirmEmailChange = async (otpCode: string) => {
    clear(); setLoading(true);
    try {
      await confirmEmailChange({ otpCode });
      logout(); // API forces logout after email change
      return true;
    } catch (err: unknown) {
      setError(extractError(err));
      return false;
    } finally { setLoading(false); }
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const handleChangePassword = async (data: ChangePasswordRequest) => {
    clear(); setLoading(true);
    try {
      await changePassword(data);
      flash('Password changed successfully!');
      return true;
    } catch (err: unknown) {
      setError(extractError(err));
      return false;
    } finally { setLoading(false); }
  };

  // ── Deactivate ─────────────────────────────────────────────────────────────
  const handleDeactivate = async (password: string) => {
    clear(); setLoading(true);
    try {
      await deactivateAccount(password);
      logout();
      return true;
    } catch (err: unknown) {
      setError(extractError(err));
      return false;
    } finally { setLoading(false); }
  };

  // ── Delete Step 1: send OTP ────────────────────────────────────────────────
  const handleRequestDelete = async () => {
    clear(); setLoading(true);
    try {
      await requestDeleteAccount();
      flash(`OTP sent to ${userEmail}`);
      return true;
    } catch (err: unknown) {
      setError(extractError(err));
      return false;
    } finally { setLoading(false); }
  };

  // ── Delete Step 2: confirm with OTP ───────────────────────────────────────
  const handleConfirmDelete = async (otp: string) => {
    clear(); setLoading(true);
    try {
      await confirmDeleteAccount({ otp });
      logout();
      return true;
    } catch (err: unknown) {
      setError(extractError(err));
      return false;
    } finally { setLoading(false); }
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