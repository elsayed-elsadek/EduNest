import { useState, useCallback } from 'react';
import type { FormErrors } from '../types/auth';
import { sendRestoreOtp, confirmRestore } from '../services/authService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await sendRestoreOtp(formData.email);

      toast.success('OTP sent to your email. Check your inbox!');
      setRestoreEmail(formData.email);

      // (اختياري) تخزين في localStorage
      localStorage.setItem('restoreEmail', formData.email);

      setStep('otp');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  //  Confirm OTP
  const confirmHandler = async () => {
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
    } catch (error: any) {
      const msg =
        error.response?.data?.message || 'Invalid or expired OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  //  Resend OTP
  const resendOtp = async () => {
    if (!restoreEmail) return;

    setLoading(true);
    try {
      await sendRestoreOtp(restoreEmail);
      toast.success('OTP resent successfully');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to resend OTP'
      );
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
    step,
    restoreEmail,
    handleInputChange,
    sendOtpHandler,
    confirmHandler,
    resendOtp,
    goBack
  };
};