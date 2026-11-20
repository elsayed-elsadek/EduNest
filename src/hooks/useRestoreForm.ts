import { useState, useCallback } from 'react';
import type { FormErrors } from '../types/auth';
import { sendRestoreOtp, confirmRestore } from '../services/authService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { showApiError } from '../utils/showApiError';
import { useCooldown } from './useCooldown';
import { formatCooldownMessage, startCooldownFromError } from '../utils/authCooldown';

interface RestoreFormData {
  email: string;
  otp: string;
}

export const useRestoreForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RestoreFormData>({
    email: '',
    otp: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [restoreEmail, setRestoreEmail] = useState('');
  const cooldown = useCooldown();
  const [cooldownErrorCode, setCooldownErrorCode] = useState('ERR_RATE_LIMITED');

  // ✅ Validate Email
  const validateEmail = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  //  Validate OTP
  const validateOtp = (): boolean => {
    const newErrors: FormErrors = {};

    if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Handle Input Change
  const handleInputChange = useCallback(
    (field: keyof RestoreFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    },
    []
  );

  //  Send OTP
  const sendOtpHandler = async () => {
    if (cooldown.isActive || loading) return false;
    if (!validateEmail()) return false;

    setLoading(true);
    try {
      await sendRestoreOtp(formData.email);

      toast.success('OTP sent to your email. Check your inbox!');
      setRestoreEmail(formData.email);

      // (اختياري) تخزين في localStorage
      localStorage.setItem('restoreEmail', formData.email);

      setStep('otp');
      return true;
    } catch (error) {
      const normalized = startCooldownFromError(error, cooldown.start);
      if (normalized.status === 429) {
        setCooldownErrorCode(normalized.errorCode);
        toast.error(formatCooldownMessage(normalized.errorCode, normalized.retryAfterSeconds ?? 60));
        return false;
      }
      // EF-2: unified envelope message (clean, with refId on 5xx) instead of
      // ad-hoc body probing.
      showApiError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  //  Confirm OTP
  const confirmHandler = async () => {
    if (cooldown.isActive || loading) return;
    if (!validateOtp()) return;

    if (!restoreEmail) {
      toast.error('Session expired, please try again');
      return;
    }

    setLoading(true);
    try {
      await confirmRestore(restoreEmail, formData.otp);

      toast.success('Account restored successfully! You can now login.');

      localStorage.removeItem('restoreEmail');
      navigate('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      const normalized = startCooldownFromError(error, cooldown.start);
      if (normalized.status === 429) {
        setCooldownErrorCode(normalized.errorCode);
        toast.error(formatCooldownMessage(normalized.errorCode, normalized.retryAfterSeconds ?? 60));
      } else {
        toast.error(normalized.message || 'Invalid or expired OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  //  Resend OTP
  const resendOtp = async () => {
    if (cooldown.isActive || loading) return;
    if (!restoreEmail) return;

    setLoading(true);
    try {
      await sendRestoreOtp(restoreEmail);
      toast.success('OTP resent successfully');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      const normalized = startCooldownFromError(error, cooldown.start);
      if (normalized.status === 429) {
        setCooldownErrorCode(normalized.errorCode);
        toast.error(formatCooldownMessage(normalized.errorCode, normalized.retryAfterSeconds ?? 60));
      } else {
        toast.error(normalized.message || 'Failed to resend OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  //  Go Back to Email Step
  const goBack = () => {
    setStep('email');
    setFormData(prev => ({ ...prev, otp: '' }));
  };

  return {
    formData,
    errors,
    loading,
    cooldown,
    cooldownErrorCode,
    step,
    restoreEmail,
    handleInputChange,
    sendOtpHandler,
    confirmHandler,
    resendOtp,
    goBack
  };
};
