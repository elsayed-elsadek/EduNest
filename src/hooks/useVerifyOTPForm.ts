import { useState } from "react";
import { verifyOTP } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";

export const useVerifyOTPForm = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  const { registrationEmail, setError: setStoreError } = useAuthStore();

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
      const response = await verifyOTP({
        email: registrationEmail,
        code,
      });

      if (!response.success) {
        const errorMsg = response.message || "OTP verification failed.";
        setError(errorMsg);
        setStoreError(errorMsg);
        return false;
      }

      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
      setStoreError(errorMsg);
      return false;
    } finally {
      setLoading(false);
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
    resetForm,
  };
};
