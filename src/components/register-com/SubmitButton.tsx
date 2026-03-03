
import React from "react";

interface Props {
  loading: boolean;
  label: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}

export const SubmitButton: React.FC<Props> = ({
  loading,
  label,
  type = "submit",
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center
        w-full
        h-12 sm:h-14
        rounded-lg sm:rounded-xl
        gap-2
        px-4 sm:px-6 md:px-8
        btn-primary-gradient
        text-white
        font-semibold
        text-sm sm:text-base
        shadow-md
        transition-all duration-300
        hover:scale-[1.02] hover:shadow-lg hover:-translate-y-0.5
        active:scale-95 active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-md
      `}
    >
      <span className="flex items-center gap-2">
        {label}
        {loading && (
          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
      </span>
    </button>
  );
};




