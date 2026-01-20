import React from "react";
import { useNavigate } from "react-router-dom";
import { BasicLayout } from "../../components/layout/BasicLayout";
import { useResetPassForm } from "../../hooks/useResetPassForm";
import {
  ResetPasswordHeader,
  ResetPasswordInput,
  ConfirmPasswordInput,
  ResetPasswordSubmitButton,
} from "../../components/resetPass-com";

const ResetPassword: React.FC = () => {
  const form = useResetPassForm();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.validate()) return;

    form.setLoading(true);

    // Simulate API call to reset password
    setTimeout(() => {
      form.setLoading(false);
      navigate("/reset-success");
    }, 1500);
  };

  return (
    <BasicLayout >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md m-auto mt-[20%] sm:mt-[5%]">
        <ResetPasswordHeader />

        <ResetPasswordInput
          value={form.formData.password}
          onChange={(v) => form.handleInputChange("password", v)}
          error={form.errors.password}
          placeholder="Create new password"
        />

        <ConfirmPasswordInput
          value={form.formData.confirmPassword}
          onChange={(v) => form.handleInputChange("confirmPassword", v)}
          error={form.errors.confirmPassword}
          password={form.formData.password}
        />

        <ResetPasswordSubmitButton loading={form.loading} />
      </form>
    </BasicLayout>
  );
};

export default ResetPassword;
