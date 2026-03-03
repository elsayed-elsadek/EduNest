import React from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

const LastNameInput: React.FC<Props> = ({ value, onChange, error }) => (
  <div className="flex flex-col w-full">
    <label className="text-xs sm:text-sm font-semibold text-gray-800 mb-2.5">Last Name</label>

    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full h-12 sm:h-14 border-2 border-gray-200 rounded-lg sm:rounded-[12px] px-4 sm:px-5
        text-sm sm:text-base placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-all duration-200
      "
      required
      minLength={2}
    />

    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

export default LastNameInput;



