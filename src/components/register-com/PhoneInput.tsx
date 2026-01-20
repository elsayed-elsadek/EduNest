
import React, { useState, useEffect } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export const PhoneInput: React.FC<Props> = ({ value, onChange, error }) => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  useEffect(() => {
    // فقط تحقق من الخطأ إذا كانت هناك قيمة وكان هناك error من الـ parent
    if (error) {
      if (!value) {
        setLocalError("Phone number is required.");
      } else if (!/^\+?\d{10,15}$/.test(value)) {
        setLocalError("Invalid phone number format.");
      } else {
        setLocalError(undefined);
      }
    } else {
      setLocalError(undefined);
    }
  }, [value, error]);

  return (
    <div className="flex flex-col w-full">
      <label className="text-xs font-medium text-gray-700 mb-2">Phone</label>

      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="+201234567890"
        className="
          w-full h-12 sm:h-14 border border-gray-300 rounded-lg sm:rounded-[12px] px-3 sm:px-4
          text-sm sm:text-base
          focus:outline-none focus:ring-2 focus:ring-primary
          transition-all duration-200
        "
        required
      />

      {(error || localError) && (
        <p className="text-red-600 text-xs mt-1">{error || localError}</p>
      )}
    </div>
  );
};
