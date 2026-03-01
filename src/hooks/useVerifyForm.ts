import { useState } from "react";
import { verifyOtp, sendOtp } from "../services/authService";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { getFirstNameFromToken } from "../utils/jwt";

export const useVerifyForm = () => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Get email from localStorage
  const email = localStorage.getItem("registrationEmail") || "";

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
  };

  const isComplete = code.every((c) => c !== "");

  const handleSubmit = async () => {
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
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Invalid verification code";
      toast.error(errorMessage);
      setSuccessMessage("");
      setErrorMessage(errorMessage); // set error message here
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found");
      return;
    }

    try {
      await sendOtp(email);
      toast.success("Verification code resent to your email!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Failed to resend code";
      toast.error(errorMessage);
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
  };
};
