import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BasicLayout } from "../../components/layout/BasicLayout";
import { useRestoreForm } from "../../hooks/useRestoreForm";

const RestoreAccount: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    sendOtpHandler,
  } = useRestoreForm();

  // Pre-fill email if coming from login (deleted account detected)
  useEffect(() => {
    const savedEmail = localStorage.getItem("restoreEmail");
    if (savedEmail) {
      handleInputChange("email", savedEmail);
    }
  }, [handleInputChange]);

  const handleSendOtp = async () => {
    await sendOtpHandler();
    // After OTP is sent, navigate to the confirm restore page
    const emailToPass = formData.email || localStorage.getItem("restoreEmail") || "";
    navigate("/confirm-restore", { state: { email: emailToPass } });
  };

  return (
    <BasicLayout>
      <div className="flex flex-col gap-6 w-full max-w-[500px] mx-auto mt-[20%] sm:mt-[8%]">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Restore Your Account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your account has been deleted. Enter your email to receive a
            restore code and reactivate your account.
          </p>
        </div>

        {/* Email Field */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="example@gmail.com"
            className={`w-full h-[55px] border rounded-[12px] px-3 focus:outline-none focus:ring-2
              ${errors.email
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-primary"
              }`}
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={loading}
          className="flex items-center justify-center w-full h-[55px] rounded-xl gap-2 px-12
            bg-[linear-gradient(90deg,rgba(21,77,113,1)_18%,rgba(51,161,224,1)_100%)]
            text-white font-semibold transition-all duration-200 hover:scale-[1.02]
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            "Send Restore Code"
          )}
        </button>

        {/* Back to login */}
        <p className="text-center text-sm text-gray-500">
          Remember your password?{" "}
          <a href="/login" className="text-blue-600 font-medium hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </BasicLayout>
  );
};

export default RestoreAccount;
