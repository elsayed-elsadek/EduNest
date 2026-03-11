import React, { useState } from "react";
import type { LoginFormData, FormErrors } from "../types/auth";
import { loginUser, sendOtp } from "../services/authService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getFirstNameFromToken, getFirstNameFromUser } from "../utils/jwt";

export const useLogin = () => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await loginUser(formData.email, formData.password);
      
      // Type assertion for API response
      const responseObj = data as Record<string, unknown>;
      const apiResponse = responseObj?.apiResponse as Record<string, unknown> | undefined;
      
      const jwt = apiResponse?.jwt as string | undefined;
      const statusMessage = apiResponse?.status as string | undefined || "Logged in successfully!";

      if (jwt) {
        toast.success(statusMessage);
        const user = (apiResponse?.user ?? responseObj?.user) as Record<string, unknown> | undefined;
        let userName = getFirstNameFromUser(user);
        if (!userName) userName = getFirstNameFromToken(jwt);
        if (!userName && user) {
          const full = String(user.name ?? user.fullName ?? user.full_name ?? user.firstName ?? user.first_name ?? '');
          userName = full.trim().split(/\s+/)[0] || '';
        }
        useAuthStore.getState().setAuth({
          token: jwt,
          userName: userName || (user?.email ? String(user.email).split('@')[0] : ''),
          userEmail: (user?.email ? String(user.email) : formData.email) ?? formData.email,
          userRole: (user?.role ? String(user.role) : '') ?? '',
        });
        
        // Save Remember Me preference
        if (formData.rememberMe) {
          useAuthStore.getState().setRememberMe(formData.email, true);
          console.log('✅ Remember Me enabled - Email saved:', formData.email);
        } else {
          useAuthStore.getState().setRememberMe('', false);
        }
        
        navigate("/mentor/dashboard");
        
      } else {
        // لم يتم إرجاع توكن، نعتبرها محاولة فاشلة
        toast.error(statusMessage || "Login failed. Please check your credentials.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorData = error.response?.data;
      const rawMsg = errorData?.errorMessages?.error 
        || errorData?.errorMessages?.['Email Error']
        || errorData?.message 
        || (errorData?.errorMessages && Object.values(errorData.errorMessages)[0]);
      const errorText = (typeof rawMsg === 'string' ? rawMsg : String(rawMsg || '')).toLowerCase();

      // حساب موجود لكن غير مفعّل → توجيه لصفحة OTP لإكمال التفعيل
      const isUnverifiedAccount =
        errorText.includes('not verified') ||
        errorText.includes('unverified') ||
        errorText.includes('request a new otp') ||
        errorText.includes('request new otp');

      if (isUnverifiedAccount) {
        try {
          localStorage.setItem("registrationEmail", formData.email);
          await sendOtp(formData.email);
          toast.success("A new verification code has been sent to your email. Complete verification to continue.");
          navigate("/verify");
        } catch (otpErr) {
          console.error("OTP Error:", otpErr);
          toast.error("Failed to send the code. Please try again.");
        }
        return;
      }

      const backendMessage = rawMsg || "Something went wrong";
      toast.error(backendMessage);
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    showPassword,
    setShowPassword,
    handleInputChange,
    handleSubmit,
  };
};

