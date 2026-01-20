import { useState } from "react";

interface ForgetPassFormData {
  email: string;
}

interface ForgetPassErrors {
  email?: string;
}

export const useForgetPassForm = () => {
  const [formData, setFormData] = useState<ForgetPassFormData>({ email: "" });
  const [errors, setErrors] = useState<ForgetPassErrors>({});
  const [loading, setLoading] = useState(false);

  const emailRegex = /^\S+@\S+\.\S+$/;

  const validate = (): boolean => {
    const newErrors: ForgetPassErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ForgetPassFormData, value: string) => {
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
