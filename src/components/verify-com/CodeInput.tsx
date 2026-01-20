import React, { useRef, useEffect } from "react";

interface Props {
  value: string;
  index: number;
  onChange: (index: number, value: string) => void;
  lastIndex: number; 
}

export const CodeInput: React.FC<Props> = ({
  value,
  index,
  onChange,
  lastIndex,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
   if (value && index < lastIndex) {
     const nextInput = inputRef.current
       ?.nextElementSibling as HTMLInputElement | null;
     nextInput?.focus();
   }
 }, [value, index, lastIndex]);

  return (
    <input
      ref={inputRef}
      type="text"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      className="
        w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-20
        text-center border rounded-lg 
        text-xl sm:text-2xl md:text-3xl
        font-semibold
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
    />
  );
};
