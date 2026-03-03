import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BasicLayout } from "../../components/layout/BasicLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  forgetPassword,
  forgetPasswordVerifyOtp,
} from "../../services/authService";


const CheckEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isComplete = code.every((c) => c !== "");
  const timerDisplay = `00:${timer.toString().padStart(2, "0")}`;

  useEffect(() => {
    // Get email from state passed from ForgetPass page
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location]);

  useEffect(() => {
    if (!timerActive) return;

    if (timer === 0) {
      setTimerActive(false);
      return;
    }

    const interval = window.setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerActive, timer]);

  const handleChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);

    setCode((prev) => {
      const updated = [...prev];
      updated[index] = sanitized;
      return updated;
    });

    // لو المستخدم كتب رقم، نروح أوتوماتيك على الخانة اللي بعدها
    if (sanitized && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // لو ضغط Backspace والخانة فاضية، نرجع للخانة اللي قبلها
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    if (!email || !isComplete) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const otp = code.join("");

    try {
      await forgetPasswordVerifyOtp(email, otp);
      setSuccessMessage("Code verified successfully.");

      // حفظ الإيميل احتياطًا لو المستخدم دخل صفحة reset مباشرة
      localStorage.setItem("resetEmail", email);

      // الانتقال إلى صفحة تغيير الباسورد
      navigate("/reset-password", { state: { email } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.errorMessages?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while verifying the code.";

      setErrorMessage(backendMessage);
      console.error("Verify OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendAndResetTimer = async () => {
    if (!email || timerActive) return;

    setTimer(60);
    setTimerActive(true);
    setCode(Array(6).fill(""));
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await forgetPassword(email);
      setSuccessMessage("A new code has been sent to your email.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.errorMessages?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while resending the code.";

      setErrorMessage(backendMessage);
      console.error("Resend code error:", error);
    }
  };

  return (
    <BasicLayout >
       <div className="flex flex-col items-center gap-6 justify-center h-[65vh] ">
        {/* Vector / Illustration */}
   <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-blue-950"/>

        {/* Heading */}
        <h1 className="text-2xl font-semibold">Enter the code</h1>
        <p className="text-center text-gray-500">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        {/* Code Inputs */}
        <div className="flex gap-4 mt-4">
          {code.map((c, i) => (
            <input
              key={i}
           ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={c}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 h-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-black text-base font-medium">
          {timerDisplay}
        </div>

        {/* Confirm Button */}
        <ConfirmButton
          loading={loading}
          onClick={handleConfirm}
          disabled={!isComplete}
        />

        {/* Resend Link */}
        <ResendLink onClick={handleResendAndResetTimer} disabled={timerActive} timer={timer} />

        {/* Success Message */}
        {successMessage && (
          <p className="text-green-600 mt-2">{successMessage}</p>
        )}
        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-600 mt-2">{errorMessage}</p>
        )}
      </div>
    </BasicLayout>
  );
};

export default CheckEmail;

interface ConfirmButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  loading,
  disabled,
  onClick,
}) => {
  return (
    <button
      className="px-6 py-3 mt-4 rounded-lg btn-primary-gradient 
                 text-white font-semibold text-sm 
                 hover:opacity-90 transition
                 disabled:opacity-60 disabled:cursor-not-allowed
                 w-1/3 mx-auto flex items-center justify-center"
      onClick={onClick}
      disabled={loading || disabled} 
    >
   
      {loading ? "Verifying..." : "Confirm"}
    </button>
  );
};

interface ResendLinkProps {
  disabled: boolean;
  timer: number;
  onClick: () => void;
}

const ResendLink: React.FC<ResendLinkProps> = ({
  disabled,
  timer,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-sm text-primary font-medium hover:underline disabled:text-gray-400"
    >
      {disabled ? `Resend code in ${timer}s` : "Resend code"}
    </button>
  );
};



