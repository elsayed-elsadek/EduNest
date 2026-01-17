import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterForm } from "../../hooks/useRegisterForm";
import {BasicLayout} from "../../components/layout/BasicLayout";
import {
  FormHeader,
  JoinAsToggle,
  PasswordInput,
  SubmitButton,
  FirstNameInput,
  LastNameInput,
  EmailInput,
  PhoneInput,
} from "../../components/register-com";

const Register: React.FC = () => {
  const form = useRegisterForm();
  const navigate = useNavigate();

 
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.validate()) return; 
    form.setLoading(true);

    // Simulate API/register process
    setTimeout(() => {
      form.setLoading(false);
      navigate("/verify"); 
    }, 1500);
  };


  return (
    <BasicLayout >
      <form onSubmit={handleRegister} className="flex flex-col gap-3 w-full ">
        <FormHeader />
        <JoinAsToggle joinAs={form.joinAs} setJoinAs={form.setJoinAs} />

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1"> */}
        <div className="flex flex-wrap md:flex-row gap-x-32 gap-y-1">
          <FirstNameInput
            value={form.formData.firstName}
            onChange={(v) => form.handleInputChange("firstName", v)}
            error={form.errors.firstName}
          />
          <LastNameInput
            value={form.formData.lastName}
            onChange={(v) => form.handleInputChange("lastName", v)}
            error={form.errors.lastName}
          />
        </div>

        <EmailInput
          value={form.formData.email}
          onChange={(v) => form.handleInputChange("email", v)}
          error={form.errors.email}
        />

        <PhoneInput
          value={form.formData.phone || ""}
          onChange={(v) => form.handleInputChange("phone", v)}
          error={form.errors.phone}
        />

        <PasswordInput
          label="Password"
          value={form.formData.password}
          onChange={(v) => form.handleInputChange("password", v)}
          showPassword={form.showPassword}
          toggleShow={() => form.setShowPassword((s) => !s)}
          error={form.errors.password}
          id="password"
        />

        <PasswordInput
          label="Confirm Password"
          value={form.formData.confirmPassword}
          onChange={(v) => form.handleInputChange("confirmPassword", v)}
          showPassword={form.showConfirmPassword}
          toggleShow={() => form.setShowConfirmPassword((s) => !s)}
          error={form.errors.confirmPassword}
          id="confirmPassword"
        />
        {/* 
     
        {/* Checkboxes */}
        
        <div className="flex flex-col sm:flex-row sm:items-center mt-2 text-sm sm:gap-10 gap-4">
          {/* Agree terms */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-3 h-3 accent-primary"
              checked={form.agreeTerms}
              onChange={(e) => form.setAgreeTerms(e.target.checked)}
            />
            I agree with
            <a href="#" className="text-[#1160f2] underline ml-0.5">
              Terms
            </a>{" "}
            and
            <a href="#" className="text-[#1160f2] underline ml-0.5">
              Privacy Policy
            </a>
          </label>
          {form.errors.agreeTerms && (
            <span className="text-red-500 text-xs mt-1 sm:mt-0">
              {form.errors.agreeTerms}
            </span>
          )}

          {/* Remember me */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-3 h-3 accent-primary"
              checked={form.rememberMe}
              onChange={(e) => form.setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <SubmitButton
          loading={form.loading}
          label="Register"
          disabled={!form.agreeTerms}
        />

        {/* Already have an account */}
        <p className="text-base font-medium text-center mt-4">
          Already have an account?{" "}
          <Link to="/login">
            <span className="text-[#1160f2] underline ml-1">Sign in</span>
          </Link>
        </p>
      </form>
    </BasicLayout>
  );
};

export default Register;
