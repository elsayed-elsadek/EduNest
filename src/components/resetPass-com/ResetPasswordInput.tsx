import React from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ResetPasswordInput: React.FC<Props> = ({
  value,
  onChange,
  error,
  placeholder = "Enter password",
}) => {
  const isValid = value.length >= 8 && passwordRegex.test(value);
  const requirements = [
    { label: "At least 8 characters", met: value.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(value) },
    { label: "One lowercase letter", met: /[a-z]/.test(value) },
    { label: "One number", met: /\d/.test(value) },
    { label: "One special character", met: /[@$!%*?&]/.test(value) },
  ];

  return (
    <div className="flex flex-col w-full gap-3">
      {/* label */}
      <label className="text-xs font-medium text-gray-700">Password</label>

      <div className="relative">
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full h-12 sm:h-14 border border-gray-300 rounded-lg sm:rounded-[12px] px-3 sm:px-4
            text-sm sm:text-base
            focus:outline-none focus:ring-2 focus:ring-[#0f5e8b]
            transition-all duration-200
            placeholder:text-gray-400
          "
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

      {/* Requirements */}
      <div className="space-y-2">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <svg
              className={`w-4 h-4 ${req.met ? "text-green-500" : "text-gray-300"}`}
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
            <span className={req.met ? "text-gray-700" : "text-gray-500"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};



