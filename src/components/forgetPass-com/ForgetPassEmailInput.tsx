import React from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

const emailRegex = /^\S+@\S+\.\S+$/;

export const ForgetPassEmailInput: React.FC<Props> = ({ value, onChange, error }) => {
  const isValid = emailRegex.test(value);

  return (
    <div className="flex flex-col w-full">
      {/* label */}
      <label className="text-xs font-medium text-gray-700 mb-2">Email Address</label>

      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your email"
          className="
            w-full h-12 sm:h-14 border border-gray-300 rounded-lg sm:rounded-[12px] px-3 sm:px-4
            text-sm sm:text-base
            focus:outline-none focus:ring-2 focus:ring-[#0f5e8b]
            transition-all duration-200
            placeholder:text-gray-400
          "
          required
        />

        {/* Check icon */}
        {isValid && (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Error message */}
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};



