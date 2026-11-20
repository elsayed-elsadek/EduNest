import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { forgetPassword } from "../services/authService";
import logger from '../utils/logger';
import { useCooldown } from './useCooldown';
import { formatCooldownMessage, startCooldownFromError } from '../utils/authCooldown';

interface ForgetPassFormData {
  email: string;
}

interface ForgetPassErrors {
  email?: string;
}

export const useForgetPassForm = () => {
  const [formData, setFormData] = useState<ForgetPassFormData>({ email: "" });
  const [errors, setErrors] = useState<ForgetPassErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const cooldown = useCooldown();
  const [cooldownErrorCode, setCooldownErrorCode] = useState('ERR_RATE_LIMITED');
  const [requestError, setRequestError] = useState('');

  const emailRegex = /^\S+@\S+\.\S+$/;

  const validate = (): boolean => {
    const newErrors: ForgetPassErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ForgetPassFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (cooldown.isActive || loading) return;

    if (!validate()) return;

    setLoading(true);
    setRequestError('');
    try {
      await forgetPassword(formData.email);
      toast.success("Verification code sent to your email.");

      navigate("/check-email", { state: { email: formData.email } });
    } catch (error: unknown) {
      const normalized = startCooldownFromError(error, cooldown.start);
      if (normalized.status === 429) {
        setCooldownErrorCode(normalized.errorCode);
        setRequestError(formatCooldownMessage(normalized.errorCode, normalized.retryAfterSeconds ?? 60));
        return;
      }
      const err = error as { response?: { data?: { errorMessages?: Record<string, string>; message?: string } }; message?: string };
      const backendMessage =
      err?.response?.data?.errorMessages?.["User Search"] ||
      err?.response?.data?.message ||
      err?.message ||
        "Something went wrong while sending reset email.";

      toast.error(backendMessage);
      logger.error("Forget password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    cooldown,
    cooldownErrorCode,
    requestError,
    setLoading,
    validate,
    handleInputChange,
    handleSubmit,
  };
};
