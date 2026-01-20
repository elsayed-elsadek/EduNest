import React from "react";

interface InputFieldProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  name?: string;
  pattern?: string;
  minLength?: number;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      type = "text",
      placeholder,
      value,
      onChange,
      required = false,
      className = "",
      id,
      ariaDescribedBy,
      ariaInvalid = false,
      name,
      pattern,
      minLength,
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        pattern={pattern}
        minLength={minLength}
        className={`border px-3 py-3 rounded-md w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
