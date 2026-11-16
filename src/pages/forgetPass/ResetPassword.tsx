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
import { forgetResetPassword, extractBackendMessage } from "../../services/authService";
import toast from "react-hot-toast";
import logger from '../../utils/logger';

/**
 * Backend-enforced TTL for the single-use resetToken (Integration Handbook §4:
 * "Single-use Reset Token (TTL: 5 Minutes)"). Enforced locally so an expired
 * token is never submitted — the user is returned to Step 1 instead.
 */
const RESET_TOKEN_TTL_MS = 5 * 60 * 1000;

/** Where Step 1 (request a fresh code) lives. */
const FORGET_PASS_ROUTE = "/forget-password";

interface ResetPassRouteState {
  email?: string;
  resetToken?: unknown;
  capturedAt?: unknown;
}

const ResetPassword: React.FC = () => {
  const form = useResetPassForm();
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state ?? null) as ResetPassRouteState | null;
  const email = state?.email || localStorage.getItem("resetEmail") || "";
  // The reset token lives in navigation state ONLY — never in storage.
  const resetToken = typeof state?.resetToken === "string" && state.resetToken ? state.resetToken : "";
  const capturedAt = typeof state?.capturedAt === "number" ? state.capturedAt : 0;

  // Strict single-use: set the moment the request is dispatched. No failure
  // path — ambiguous or definitive — ever unlocks the token for a retry.
  const tokenConsumed = React.useRef(false);

  const returnToStepOne = (message: string) => {
    toast.error(message);
    navigate(FORGET_PASS_ROUTE);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.validate()) return;

    if (!email || !resetToken) {
      returnToStepOne("Session expired. Please restart the reset password process.");
      return;
    }

    if (!capturedAt || Date.now() - capturedAt > RESET_TOKEN_TTL_MS) {
      returnToStepOne("Your reset code has expired. Please request a new one.");
      return;
    }

    if (tokenConsumed.current) return;
    tokenConsumed.current = true;

    form.setLoading(true);
    try {
      const message = await forgetResetPassword(email, resetToken, form.formData.password);
      toast.success(message || "Password reset successfully.");
      navigate("/reset-success");
    } catch (error: unknown) {
      const backendMessage = extractBackendMessage(
        error,
        "Something went wrong while resetting password."
      );

      // The token is single-use and already consumed — any failure (ambiguous
      // network error, lost response, or backend rejection) means the user
      // must restart from Step 1. Never allow a retry with the same token.
      logger.error("Reset password error:", backendMessage);
      returnToStepOne(backendMessage);
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


