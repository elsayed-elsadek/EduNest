import React from "react";
import { useNavigate } from "react-router-dom";
import { BasicLayout } from "../../components/layout/BasicLayout";
import { useForgetPassForm } from "../../hooks/useForgetPassForm";
import { formatCooldownMessage } from '../../utils/authCooldown';
import {
  ForgetPassHeader,
  ForgetPassEmailInput,
  ForgetPassSubmitButton,
} from "../../components/forgetPass-com";

const ForgetPass: React.FC = () => {
  const form = useForgetPassForm();
  const navigate = useNavigate();

  return (
    <BasicLayout>
        
      <form onSubmit={form.handleSubmit} className="flex flex-col gap-6 w-full max-w-[500px] mx-auto mt-[20%] sm:mt-[15%]">
        <ForgetPassHeader />

        <ForgetPassEmailInput
          value={form.formData.email}
          onChange={(v) => form.handleInputChange("email", v)}
          error={form.errors.email}
        />

        {form.requestError && !form.cooldown.isActive && <p role="alert" className="text-sm text-red-700">{form.requestError}</p>}
        {form.cooldown.isActive && (
          <p role="status" className="text-sm text-red-700">
            {formatCooldownMessage(form.cooldownErrorCode, form.cooldown.remainingSeconds)}
          </p>
        )}
        <ForgetPassSubmitButton loading={form.loading} disabled={form.cooldown.isActive} />

        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
          <span>Remember your password?</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-primary font-medium hover:underline transition"
          >
            Sign In
          </button>
        </div>
      </form>
    </BasicLayout>
  );
};

export default ForgetPass;


