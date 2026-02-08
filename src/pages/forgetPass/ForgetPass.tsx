import React from "react";
import { useNavigate } from "react-router-dom";
import { BasicLayout } from "../../components/layout/BasicLayout";
import { useForgetPassForm } from "../../hooks/useForgetPassForm";
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

        <ForgetPassSubmitButton loading={form.loading} />

        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
          <span>Remember your password?</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#0f5e8b] font-medium hover:underline transition"
          >
            Sign In
          </button>
        </div>
      </form>
    </BasicLayout>
  );
};

export default ForgetPass;
