import React from "react";

interface Props {
  loading: boolean;
}

export const ResetPasswordSubmitButton: React.FC<Props> = ({ loading }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`
        flex items-center justify-center
        w-full
        h-12 sm:h-14
        rounded-lg sm:rounded-xl
        gap-2
        px-4 sm:px-6 md:px-8
        bg-primary
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
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Resetting...
        </>
      ) : (
        "Reset Password"
      )}
    </button>
  );
};



