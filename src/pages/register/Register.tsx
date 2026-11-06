import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterForm } from "../../hooks/useRegisterForm";
import { BasicLayout } from "../../components/layout/BasicLayout";
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
import { registerStudent, registerMentor, sendOtp } from "../../services/authService";
import toast from "react-hot-toast";

const Register: React.FC = () => {
  const form = useRegisterForm();
  const navigate = useNavigate();

  // Handle form submission based on user type (student or mentor)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    form.setLoading(true);
    form.clearErrors();

    // Validate form before submitting
    if (!form.validate()) {
      form.setLoading(false);
      toast.error("Please fix all errors before submitting");
      return;
    }

    try {
      // Call the appropriate API based on user selection
      const response = form.joinAs === "student" 
        ? await registerStudent(form.formData)
        : await registerMentor(form.formData);
      
      const res = response as { message?: string };
      form.clearErrors();
      toast.success(res.message || 'Registration Successful');
      
      // Send OTP to email
      try {
        // Store email and user type for verification page
        localStorage.setItem("registrationEmail", form.formData.email);
        localStorage.setItem("registrationType", form.joinAs);
        
        const otpRes = await sendOtp(form.formData.email) as { message?: string };
        toast.success(otpRes.message || 'OTP sent to your email');
      } catch {
        // Continue to verify page even if OTP fails
      }
      
      navigate("/verify");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorStatus = err.response?.status;
      const errorData = err.response?.data;

      // Extract error message from any potential source
      const rawMsg = errorData?.errorMessages?.['Email Error'] 
        || errorData?.message 
        || (errorData?.errorMessages && Object.values(errorData.errorMessages)[0]);
      const errorText = (typeof rawMsg === 'string' ? rawMsg : String(rawMsg || '')).toLowerCase();
      
      // Account exists but unverified -> automatic redirect to OTP page
      const isUnverifiedAccount = 
        errorText.includes('not verified') ||
        errorText.includes('unverified') ||
        errorText.includes('request a new otp') ||
        errorText.includes('request new otp');
      
      if (isUnverifiedAccount) {
        try {
          localStorage.setItem("registrationEmail", form.formData.email);
          localStorage.setItem("registrationType", form.joinAs);
          const otpRes = await sendOtp(form.formData.email) as { message?: string };
          toast.success(otpRes.message || 'A new verification code has been sent to your email');
        } catch {
          toast.error('Failed to send the code. Please try again.');
        }
        navigate("/verify");
        return;
      }
      
      // Check if error is related to duplicate email (409 Conflict)
      if (errorStatus === 409 && errorData?.errorMessages?.['Email Error']) {
        const msg = errorData.errorMessages['Email Error'];
        form.setEmailError(msg);
        toast.error(msg);
      } else if (errorStatus === 400 && (errorText.includes('email') || errorText.includes('duplicate')) && !isUnverifiedAccount) {
        form.setEmailError('This email is already registered. Please use a different email.');
        toast.error('Email already exists. Please use a different email.');
      } else {
        const errorMessage =
          (errorData?.errorMessages && Object.values(errorData.errorMessages)[0]) ||
          errorData?.message ||
          err.message ||
          'Registration Failed';
        form.setGeneralError(typeof errorMessage === 'string' ? errorMessage : 'Registration Failed');
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Registration Failed');
      }
    } finally {
      form.setLoading(false);
    }
  };

  return (
    <BasicLayout>
      <form onSubmit={handleRegister} className="flex flex-col gap-5 w-full">
        <FormHeader />
        
        {/* General Error Message */}
        {form.errors.general && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 flex items-baseline gap-2">
            <span className="text-red-600 font-semibold text-lg mt-0.5">⚠</span>
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">{form.errors.general}</p>
            </div>
          </div>
        )}
        
        <JoinAsToggle joinAs={form.joinAs} setJoinAs={form.setJoinAs} />

        {/* First Name and Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
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
          value={form.formData.phoneNumber || ""}
          onChange={(v) => form.handleInputChange("phoneNumber", v)}
          error={form.errors.phoneNumber}
        />

        {/* Educational Level - Only for Students (Styled & Brand Colorized) */}
        {form.joinAs === "student" && (
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Level
            </label>
            <div className="relative">
              <select
                value={form.formData.educationalLevel || ""}
                onChange={(e) => form.handleInputChange("educationalLevel", e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f5e8b] focus:border-transparent transition-all appearance-none cursor-pointer text-sm text-gray-800 ${
                  form.errors.educationalLevel ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <option value="" className="text-gray-400">Select your educational level</option>
                <option value="FRESH">FRESH</option>
                <option value="JUNIOR">JUNIOR</option>
                <option value="SENIOR">SENIOR</option>
              </select>
              {/* Custom smooth arrow for Select Dropdown */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>
            {form.errors.educationalLevel && (
              <p className="text-red-500 text-xs mt-1 font-medium">{form.errors.educationalLevel}</p>
            )}
          </div>
        )}

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
        
        <div className="flex flex-col gap-3 sm:gap-4 mt-2 text-xs sm:text-sm">
          {/* Agree terms */}
          <label className="flex items-start sm:items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#0f5e8b] mt-0.5 sm:mt-0 flex-shrink-0 rounded cursor-pointer"
              checked={form.agreeTerms}
              onChange={(e) => form.setAgreeTerms(e.target.checked)}
            />
            <span className="text-gray-600">
              I agree with{" "}
              <a href="#" className="text-[var(--primary-500)] hover:underline font-semibold transition-colors">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-[var(--primary-500)] hover:underline font-semibold transition-colors">
                Privacy Policy
              </a>
            </span>
          </label>
          {form.errors.agreeTerms && (
            <span className="text-red-500 text-xs font-medium ml-6">
              {form.errors.agreeTerms}
            </span>
          )}

          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#0f5e8b] flex-shrink-0 rounded cursor-pointer"
              checked={form.rememberMe}
              onChange={(e) => form.setRememberMe(e.target.checked)}
            />
            <span className="text-gray-600 font-medium">Remember me</span>
          </label>
        </div>

        {/* Submit Button */}
        <SubmitButton
          loading={form.loading}
          label="Register"
          disabled={!form.agreeTerms}
        />

        {/* Already have an account */}
        <p className="text-xs sm:text-sm text-gray-500 text-center mt-3">
          Already have an account?{" "}
          <Link to="/login">
            <span className="text-[var(--primary-500)] hover:underline font-semibold transition-colors">Sign in</span>
          </Link>
        </p>
      </form>
    </BasicLayout>
  );
};

export default Register;