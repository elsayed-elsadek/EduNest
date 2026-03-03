import React from "react";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  timer?: number;
}

export const ResendLink: React.FC<Props> = ({ onClick, disabled = false, timer = 0 }) => {
  return (
    <p
      className={`mt-2 text-sm underline text-center cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'text-[#19587f80]'
      }`}
      onClick={disabled ? undefined : onClick}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
    >
      {disabled && timer > 0 ? `Resend code (wait ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')})` : 'Resend code'}
    </p>
  );
};



