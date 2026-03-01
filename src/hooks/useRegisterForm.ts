
import { useState, useRef } from "react";
import type { RegisterFormData, FormErrors, JoinAs } from "../types/auth";

export const useRegisterForm = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    educationalLevel: "",
  });

  const [errors, setErrors] = useState<Partial<FormErrors>>({});
  const [loading, setLoading] = useState(false);
  const [joinAs, setJoinAs] = useState<JoinAs>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);

  const emailRegex = /^\S+@\S+\.\S+$/;
  const phoneRegex = /^[0-9]{10,15}$/;

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setGeneralError = (message: string) => {
    setErrors((prev) => ({ ...prev, general: message }));
  };

  const setEmailError = (message: string) => {
    setErrors((prev) => ({ ...prev, email: message }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormErrors> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email.";

    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = "Invalid phone number.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    if (joinAs === "student" && !formData.educationalLevel) {
      newErrors.educationalLevel = "Educational level is required.";
    }

    if (!agreeTerms) newErrors.agreeTerms = "You must agree to the Terms and Privacy Policy.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formData,
    errors,
    loading,
    joinAs,
    showPassword,
    showConfirmPassword,
    agreeTerms,
    rememberMe,
    formRef,
    setJoinAs,
    setShowPassword,
    setShowConfirmPassword,
    setAgreeTerms,
    setRememberMe,
    setLoading,
    handleInputChange,
    setGeneralError,
    setEmailError,
    clearErrors,
    validate, 
  };
};