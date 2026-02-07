import React, { useState } from "react";
import type { LoginFormData, FormErrors } from "../types/auth";
import { loginUser } from "../services/authService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

      const jwt = data?.messages?.jwt;
      const statusMessage = data?.messages?.status || "Logged in successfully!";

      if (jwt) {
        // نجاح تسجيل الدخول
        toast.success(statusMessage);

        localStorage.setItem("token", jwt);
        localStorage.setItem("isAuthenticated", "true");

// هاتروح للداش بورد  بس لما تخلص 
        navigate("/");
        
      } else {
        // لم يتم إرجاع توكن، نعتبرها محاولة فاشلة
        toast.error(statusMessage || "Login failed. Please check your credentials.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // أخطاء الشبكة أو أخطاء من السيرفر (غير 2xx)
      const backendMessage = 
      error.response?.data?.errorMessages?.error ||  // المسار الذي ذكرته
      error.response?.data?.message ||               // مسار شائع آخر
      error.message ||                               // رسالة Axios نفسها (مثل Network Error)
      "Something went wrong";
        // error.response?.data?.message ||
       
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