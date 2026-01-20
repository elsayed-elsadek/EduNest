import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BasicLayout } from "../../components/layout/BasicLayout";


const CheckEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Get email from state passed from ForgetPass page
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location]);

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <BasicLayout imageType="create">
      <div className="flex flex-col gap-6 w-full max-w-md items-center justify-center py-8 m-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Check your mail
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            We sent a password reset link to your registered email address. 
            Click the link in the email to proceed.
          </p>
        </div>

        {/* Envelope Icon
        <div className="w-16 h-16 mb-6">
         <FontAwesomeIcon icon={faMessage}
         className="blueTextColor p-4 text-2xl"
         />
                 </div> */}

        {/* Email Display */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6 w-full text-center">
          <p className="text-sm text-gray-600">Email sent to:</p>
          <p className="text-base font-semibold text-gray-900 break-all">{email}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8 w-full text-sm text-gray-700">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0f5e8b] text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <p>Check your email inbox</p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0f5e8b] text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <p>Click on the reset link in the email</p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0f5e8b] text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <p>Create a new password</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="flex-1 h-12 sm:h-14 rounded-lg sm:rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base transition-all hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => navigate("/reset-password")}
            className="flex-1 h-12 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#154d71] via-[#2a7fa8] to-[#33a1e0] text-white font-semibold text-sm sm:text-base shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            Continue
          </button>
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Click the "Continue" button to proceed with resetting your password.
        </p>
      </div>
    </BasicLayout>
  );
};

export default CheckEmail;
