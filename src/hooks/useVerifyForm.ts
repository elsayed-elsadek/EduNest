import { useState } from "react";
import { verifyOtp, sendOtp } from "../services/authService";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { getFirstNameFromToken } from "../utils/jwt";
import { useCooldown } from './useCooldown';
import { getCooldownMessage, startCooldownFromError } from '../utils/authCooldown';

export const useVerifyForm = () => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldownErrorCode, setCooldownErrorCode] = useState('ERR_RATE_LIMITED');
  const [hasCooldown, setHasCooldown] = useState(false);
  const cooldown = useCooldown();

  // Get email from localStorage
  const email = localStorage.getItem("registrationEmail") || "";

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
  };

  const isComplete = code.every((c) => c !== "");

  const handleSubmit = async () => {
    if (cooldown.isActive || loading) return false;
    if (!isComplete || !email) {
      toast.error("Please enter the complete code");
      return;
    }

    setLoading(true);
    try {
      const otp = code.join("");
      const response = await verifyOtp(email, otp);

      setSuccessMessage("Code verified successfully!");
      setErrorMessage(""); // clear error on success
      toast.success("Email verified successfully!");

      // Extract token from response if available
      if (response && typeof response === 'object') {
        const responseObj = response as Record<string, unknown>;
        const jwt = responseObj.jwt || responseObj.token || (responseObj.apiResponse as Record<string, unknown>)?.jwt;
        
        if (jwt && typeof jwt === 'string') {
          // Extract user info from token
          const userName = getFirstNameFromToken(jwt);
          useAuthStore.getState().setAuth({
            token: jwt,
            userName: userName || '',
            userEmail: email,
            userRole: '',
          });
        }
      }

      // Clear email from localStorage
      localStorage.removeItem("registrationEmail");

      return response;
    } catch (error: unknown) {
      const normalized = startCooldownFromError(error, cooldown.start);
      if (normalized.status === 429) {
        setCooldownErrorCode(normalized.errorCode);
        setHasCooldown(true);
      }
      const message = normalized.status === 429 && normalized.retryAfterSeconds !== undefined
        ? getCooldownMessage(normalized, normalized.retryAfterSeconds)
        : normalized.message || "Invalid verification code";
      toast.error(message);
      setSuccessMessage("");
      setErrorMessage(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (): Promise<boolean> => {
    if (cooldown.isActive) return false;
    if (!email) {
      toast.error("Email not found");
      return false;
    }

    try {
      await sendOtp(email);
      toast.success("Verification code resent to your email!");
      return true;
    } catch (error: unknown) {
      const normalized = startCooldownFromError(error, cooldown.start);
      if (normalized.status === 429) {
        setCooldownErrorCode(normalized.errorCode);
        setHasCooldown(true);
      }
      const message = normalized.status === 429 && normalized.retryAfterSeconds !== undefined
        ? getCooldownMessage(normalized, normalized.retryAfterSeconds)
        : normalized.message || "Failed to resend code";
      toast.error(message);
      setErrorMessage(message);
      return false;
    }
  };

  return {
    code,
    loading,
    successMessage,
    errorMessage,
    handleChange,
    handleSubmit,
    handleResend,
    isComplete,
    cooldown,
    cooldownErrorCode,
    setCooldownErrorCode,
    hasCooldown,
    setHasCooldown,
  };
};
