import React, { useState } from "react";
import type { LoginFormData, FormErrors } from "../types/auth";

export const useLogin = () => {
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
      console.log("Logging in with:", formData);
      // هنا سيتم استدعاء الـ AuthService لاحقاً
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