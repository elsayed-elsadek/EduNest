import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BasicLayout } from "../../components/layout/BasicLayout";
import { useResetPassForm } from "../../hooks/useResetPassForm";
import {
  ResetPasswordHeader,
  ResetPasswordInput,
  ConfirmPasswordInput,
  ResetPasswordSubmitButton,
} from "../../components/resetPass-com";
import { forgetResetPassword } from "../../services/authService";
import toast from "react-hot-toast";

const ResetPassword: React.FC = () => {
  const form = useResetPassForm();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { email?: string } | null;
  const email = state?.email || localStorage.getItem("resetEmail") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.validate()) return;

    if (!email) {
      toast.error("Email not found. Please restart the reset password process.");
      return;
    }

    form.setLoading(true);
    try {
      await forgetResetPassword(email, form.formData.password);
      toast.success("Password reset successfully.");
      navigate("/reset-success");
    } catch (error) {
      const backendMessage =
        (typeof error === "object" && (error as { errorMessages?: { error?: string }; message?: string })?.errorMessages?.error) ||
        (typeof error === "object" && (error as { message?: string })?.message) ||
        (typeof error === "string" ? error : null) ||
        "Something went wrong while resetting password.";

      toast.error(backendMessage);
      console.error("Reset password error:", error);
    } finally {
      form.setLoading(false);
    }
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
