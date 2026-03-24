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
  const [step, setStep] = useState<'email' | 'otp'>('email'); // Multi-step form
  const [restoreEmail, setRestoreEmail] = useState('');

  const validateEmail = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.otp || formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback((field: keyof RestoreFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const sendOtpHandler = async () => {
    if (!validateEmail()) return;
    
    setLoading(true);
    try {
      await sendRestoreOtp(formData.email);
      toast.success('OTP sent to your email. Check your inbox!');
      setRestoreEmail(formData.email);
      setStep('otp');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const confirmHandler = async () => {
    if (!validateOtp()) return;

    setLoading(true);
    try {
      await confirmRestore(restoreEmail || formData.email, formData.otp);
      toast.success('Account restored successfully! You can now login.');
      localStorage.removeItem('restoreEmail');
      navigate('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid or expired OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    await sendOtpHandler();
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
    goBack: () => setStep('email')
  };
};

