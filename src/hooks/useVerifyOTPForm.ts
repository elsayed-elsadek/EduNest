import { useState } from "react";
import { verifyOtp, sendOtp } from "../services/authService";

export const useVerifyOTPForm = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  // Get email from localStorage
  const registrationEmail = localStorage.getItem("registrationEmail") || "";

  const validateCode = (): boolean => {
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return false;
    }
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Code must be 6 digits.");
      return false;
    }
    return true;
  };

  const handleVerifyOTP = async (): Promise<boolean> => {
    if (!validateCode()) return false;
    if (!registrationEmail) {
      setError("Email not found. Please register again.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyOtp(registrationEmail, code);
      return true;
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      const errorMsg = errObj.response?.data?.message || "An unexpected error occurred";
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registrationEmail) {
      setError("Email not found. Please register again.");
      return;
    }

    try {
      await sendOtp(registrationEmail);
      setTimeLeft(600);
      setCanResend(false);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      const errorMsg = errObj.response?.data?.message || "Failed to resend code";
      setError(errorMsg);
    }
  };

  const resetForm = () => {
    setCode("");
    setError(null);
  };

  return {
    code,
    setCode,
    loading,
    error,
    timeLeft,
    setTimeLeft,
    canResend,
    setCanResend,
    validateCode,
    handleVerifyOTP,
    handleResend,
    resetForm,
  };
};

