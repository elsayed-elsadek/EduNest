import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CodeInput } from "../../components/verify-com/CodeInput";
import { ConfirmButton } from "../../components/verify-com/ConfirmButton";
import { ResendLink } from "../../components/verify-com/ResendLink";
import { useVerifyForm } from "../../hooks/useVerifyForm";
import { BasicLayout } from "../../components/layout/BasicLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export const Verify: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [timer, setTimer] = useState<number>(120);
  const [timerActive, setTimerActive] = useState(true);

  const {
    code,
    loading,
    successMessage,
    errorMessage,
    handleChange,
    handleSubmit,
    handleResend,
    isComplete,
  } = useVerifyForm();

  useEffect(() => {
    // Get email from localStorage (يبقى محفوظ حتى بعد الـ refresh)
    const storedEmail = localStorage.getItem("registrationEmail") || "";
    setEmail(storedEmail);
    if (!storedEmail) {
      navigate("/register", { replace: true });
    }
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) setTimerActive(false);
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timer]);

  const handleConfirm = async () => {
    const response = await handleSubmit();
    if (response) {
      setTimeout(() => {
        navigate("/success");
      }, 1500);
    }
  };

  // New resend handler: resets timer
  const handleResendAndResetTimer = async () => {
    await handleResend();
    setTimer(120);
    setTimerActive(true);
  };

  // Helper for timer format
  const timerMin = String(Math.floor(timer / 60)).padStart(2, '0');
  const timerSec = String(timer % 60).padStart(2, '0');
  const timerDisplay = `${timerMin}:${timerSec}`;

  return (
    <BasicLayout>
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
            <CodeInput
              key={i}
              value={c}
              index={i}
              lastIndex={code.length - 1}
              onChange={handleChange}
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



