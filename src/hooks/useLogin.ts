import React, { useState } from "react";
import type { LoginFormData, FormErrors } from "../types/auth";
import { loginUser, sendOtp } from "../services/authService";
import { getStudentProfile } from "../services/student-roleService/Studentprofileservice";
import { getAssetUrl } from "../config/env";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getFirstNameFromToken, getFirstNameFromUser, getRoleFromToken, getUserFromToken, isTokenValid } from "../utils/jwt";
import logger from "../utils/logger";
import { getDashboardPath, getSafeRedirectPath } from "../routes/routeUtils";

export const useLogin = () => {

  const navigate = useNavigate();
  const location = useLocation();
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
      // FE-027: the refresh token ships with the login pair (EB-91) — it is the
      // single-use key for silent renewal and logout revocation.
      const refreshToken = apiResponse?.refreshToken as string | undefined;
      // FE-027: body `Role` is a bare enum (STUDENT|MENTOR|ADMIN) — normalize it
      // to the `ROLE_*` shape the JWT authorities use, as a fallback when the
      // token itself carries no readable role.
      const backendRole =
        typeof apiResponse?.Role === "string" ? `ROLE_${apiResponse.Role.toUpperCase()}` : "";
      const statusMessage = apiResponse?.status as string | undefined || "Logged in successfully!";

      if (jwt && isTokenValid(jwt)) {
        toast.success(statusMessage);

        // Extract user information from JWT token
        const tokenUser = getUserFromToken(jwt);
        const user = (apiResponse?.user ?? responseObj?.user) as Record<string, unknown> | undefined;

        // Get user details with fallbacks
        let userName = tokenUser?.fullName || getFirstNameFromUser(user);
        if (!userName) userName = getFirstNameFromToken(jwt);
        if (!userName && user) {
          const full = String(user.name ?? user.fullName ?? user.full_name ?? user.firstName ?? user.first_name ?? '');
          userName = full.trim().split(/\s+/)[0] || '';
        }

        // Get role from JWT token
        const userRole = tokenUser?.role || getRoleFromToken(jwt) || (user?.role ? String(user.role) : '');

        // Get email with fallbacks
        const userEmail = tokenUser?.email ||
                         (user?.email ? String(user.email) : formData.email) ||
                         formData.email;

        // Set authentication data (token pair per EB-91)
        useAuthStore.getState().setAuth({
          token: jwt,
          refreshToken: refreshToken ?? "",
          userName: userName || userEmail.split('@')[0],
          userEmail: userEmail,
          userRole: userRole || backendRole,
        });

        // Fetch profile image for students
        if (userRole === 'ROLE_STUDENT') {
          try {
            const profileResponse = await getStudentProfile();
            const profileImageUrl = profileResponse.apiResponse.profile.profileImageUrl;
            if (profileImageUrl) {
              const fullAvatarUrl = getAssetUrl(profileImageUrl);
              useAuthStore.getState().updateProfile({ userAvatar: fullAvatarUrl });
            }
          } catch (error) {
            logger.warn('Failed to fetch student profile image', error);
          }
        }

        // Save Remember Me preference
        if (formData.rememberMe) {
          useAuthStore.getState().setRememberMe(formData.email, true);
        } else {
          useAuthStore.getState().setRememberMe('', false);
        }

        // Return to a validated same-origin deep link after login; otherwise
        // use the single canonical dashboard mapping for the authenticated role.
        const from = (location.state as { from?: unknown } | null)?.from;
        const redirectPath =
          getSafeRedirectPath(from) ?? getDashboardPath(userRole) ?? '/unauthorized';
        navigate(redirectPath, { replace: true });

      } else if (jwt) {
        // FE-008: never authenticate the session with a malformed or expired token.
        toast.error("We couldn't start your session because the token was invalid. Please try again.");
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

      // حساب محذوف (soft delete) → توجيه لصفحة استرجاع الحساب
      const isDeletedAccount =
        errorText.includes('deleted') ||
        errorText.includes('account is deleted') ||
        errorText.includes('account deleted');

      if (isDeletedAccount) {
        localStorage.setItem("restoreEmail", formData.email);
        toast("Your account is deleted. Redirecting to account restore...", {
          icon: "⚠️",
          duration: 3000,
        });
        navigate("/restore-account");
        return;
      }

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
          logger.error("Failed to resend the verification code", otpErr);
          toast.error("Failed to send the code. Please try again.");
        }
        return;
      }

      const backendMessage = rawMsg || "Something went wrong";
      toast.error(backendMessage);
      logger.error("Login failed", error);
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
