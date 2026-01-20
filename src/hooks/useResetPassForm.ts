import { useState } from "react";

interface ResetPassFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPassErrors {
  password?: string;
  confirmPassword?: string;
}

export const useResetPassForm = () => {
  const [formData, setFormData] = useState<ResetPassFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPassErrors>({});
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validate = (): boolean => {
    const newErrors: ResetPassErrors = {};

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password does not meet requirements";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof ResetPassFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return {
    formData,
    errors,
    loading,
    setLoading,
    validate,
    handleInputChange,
  };
};
