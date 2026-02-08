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
import { registerStudent , registerMentor , sendOtp} from "../../services/authService";
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
      
      console.log('Server Response:', response);
      form.clearErrors();
      toast.success(response.message || 'Registration Successful');
      
      // Send OTP to email
      try {
        // Store email for verification page
        localStorage.setItem("registrationEmail", form.formData.email);
        
        const otpRes = await sendOtp(form.formData.email);
        toast.success(otpRes.message  || 'OTP sent to your email');
      } catch (otpErr: unknown) {
        console.log('OTP Error:', otpErr);
        // Continue to verify page even if OTP fails
      }
      
      navigate("/verify");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorStatus = err.response?.status;
      const errorData = err.response?.data;
      
      console.log('Error Response:', errorData);
      
      // Check if error is related to duplicate email (409 Conflict)
      if (errorStatus === 409 && errorData?.errorMessages?.['Email Error']) {
        const emailErrorMsg = errorData.errorMessages['Email Error'];
        form.setEmailError(emailErrorMsg);
        toast.error(emailErrorMsg);
      } else if (errorStatus === 400 && (errorData?.message?.toLowerCase().includes('email') || errorData?.message?.toLowerCase().includes('duplicate'))) {
        form.setEmailError('This email is already registered. Please use a different email.');
        toast.error('Email already exists. Please use a different email.');
      } else {
        const errorMessage = Object.values(errorData?.errorMessages || {})[0] || err.message || 'Registration Failed';
        form.setGeneralError(errorMessage);
        toast.error(errorMessage);
      }
      console.log(err);
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

        {/* Educational Level - Only for Students */}
        {form.joinAs === "student" && (
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Educational Level
            </label>
            <select
              value={form.formData.educationalLevel || ""}
              onChange={(e) => form.handleInputChange("educationalLevel", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select your educational level</option>
              <option value="1">High School</option>
              <option value="2">Bachelor's Degree</option>
              <option value="3">Master's Degree</option>
              <option value="4">Ph.D</option>
              <option value="5">Professional Certification</option>
            </select>
            {form.errors.educationalLevel && (
              <p className="text-red-500 text-xs mt-1">{form.errors.educationalLevel}</p>
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
        {/* Checkboxes */}
        
        <div className="flex flex-col gap-3 sm:gap-4 mt-4 text-xs sm:text-sm">
          {/* Agree terms */}
          <label className="flex items-start sm:items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-500 mt-1 sm:mt-0 flex-shrink-0 rounded cursor-pointer"
              checked={form.agreeTerms}
              onChange={(e) => form.setAgreeTerms(e.target.checked)}
            />
            <span className="flex flex-wrap gap-1 text-gray-700">
              I agree with
              <a href="#" className="text-blue-600 hover:text-blue-700 underline font-semibold transition-colors">
                Terms
              </a>
              and
              <a href="#" className="text-blue-600 hover:text-blue-700 underline font-semibold transition-colors">
                Privacy Policy
              </a>
            </span>
          </label>
          {form.errors.agreeTerms && (
            <span className="text-red-500 text-xs font-medium">
              {form.errors.agreeTerms}
            </span>
          )}

          {/* Remember me */}
          <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-500 flex-shrink-0 rounded cursor-pointer"
              checked={form.rememberMe}
              onChange={(e) => form.setRememberMe(e.target.checked)}
            />
            <span className="text-gray-700">Remember me</span>
          </label>
        </div>

        {/* Submit Button */}
        <SubmitButton
          loading={form.loading}
          label="Register"
          disabled={!form.agreeTerms}
        />

        {/* Already have an account */}
        <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center mt-4 sm:mt-5">
          Already have an account?{" "}
          <Link to="/login">
            <span className="text-blue-600 hover:text-blue-700 underline font-semibold transition-colors">Sign in</span>
          </Link>
        </p>
      </form>
    </BasicLayout>
  );
};

export default Register;
