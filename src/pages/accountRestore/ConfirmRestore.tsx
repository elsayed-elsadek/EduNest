import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BasicLayout } from "../../components/layout/BasicLayout";
import { confirmRestore, sendRestoreOtp } from "../../services/authService";
import toast from "react-hot-toast";

const ConfirmRestore: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isComplete = code.every((c) => c !== "");
  const timerDisplay = `00:${timer.toString().padStart(2, "0")}`;

  // Resolve email: from navigation state or localStorage
  useEffect(() => {
    const state = location.state as { email?: string };
    const resolvedEmail =
      state?.email || localStorage.getItem("restoreEmail") || "";
    setEmail(resolvedEmail);
  }, [location]);

  // Countdown timer
  useEffect(() => {
    if (!timerActive || timer === 0) {
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
    if (sanitized && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      newCode[i] = char;
    });
    setCode(newCode);
    // Focus the last filled input
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleConfirm = async () => {
    if (!email || !isComplete) return;

    setLoading(true);
    setErrorMessage("");
    const otp = code.join("");

    try {
      await confirmRestore(email, otp);
      // Clean up stored email
      localStorage.removeItem("restoreEmail");
      toast.success("Account restored successfully! You can now log in.");
      navigate("/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errorMessages?: { error?: string } } }; message?: string };
      const msg =
        err?.response?.data?.errorMessages?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired OTP. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || timerActive) return;

    setTimer(60);
    setTimerActive(true);
    setCode(Array(6).fill(""));
    setErrorMessage("");

    try {
      await sendRestoreOtp(email);
      toast.success("A new restore code has been sent to your email.");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend code. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <BasicLayout>
      <div className="flex flex-col items-center gap-6 justify-center min-h-[65vh]">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Enter the Restore Code</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter the 6-digit code sent to{" "}
            <strong className="text-gray-700">{email}</strong>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-3 mt-2" onPaste={handlePaste}>
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
              className={`w-11 h-11 text-center text-lg font-semibold border rounded-lg
                focus:outline-none focus:ring-2
                ${c ? "border-primary bg-blue-50" : "border-gray-300"}
                ${errorMessage ? "border-red-400 focus:ring-red-200" : "focus:ring-primary"}
                transition-all`}
            />
          ))}
        </div>

        {/* Timer */}
        <p
          className={`text-sm font-medium ${
            timerActive ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {timerActive ? `Code expires in ${timerDisplay}` : "Code expired"}
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600 w-full max-w-xs">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isComplete || loading}
          className="w-full max-w-xs h-[50px] rounded-xl
            bg-[linear-gradient(90deg,rgba(21,77,113,1)_18%,rgba(51,161,224,1)_100%)]
            text-white font-semibold text-sm flex items-center justify-center gap-2
            hover:scale-[1.02] transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Restoring...
            </>
          ) : (
            "Restore Account"
          )}
        </button>

        {/* Resend OTP */}
        <button
          type="button"
          onClick={handleResend}
          disabled={timerActive}
          className="text-sm font-medium transition-colors
            disabled:text-gray-400 disabled:cursor-not-allowed
            enabled:text-blue-600 enabled:hover:underline"
        >
          {timerActive
            ? `Resend code in ${timer}s`
            : "Resend restore code"}
        </button>

        {/* Back to restore */}
        <button
          type="button"
          onClick={() => navigate("/restore-account")}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Change email
        </button>
      </div>
    </BasicLayout>
  );
};

export default ConfirmRestore;
