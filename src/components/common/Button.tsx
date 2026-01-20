import React from "react";

interface ButtonProps {
  type?: "button" | "submit";
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  width?: string;
  height?: string;
  
  rounded?: string;
}


const Button: React.FC<ButtonProps> = ({
  type = "button",
  onClick,
  children,
  className = "",
  disabled = false,
  width = "w-full",
  height = "h-14",
  rounded = "rounded-md",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        all-[unset] box-border
        ${width} ${height}
        ${rounded}
        flex items-center justify-center gap-2 px-6
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        bg-[linear-gradient(90deg,rgba(21,77,113,1)_18%,rgba(51,161,224,1)_100%)]
        text-white font-semibold
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <span className="flex items-center justify-center w-fit">{children}</span>
    </button>
  );
};

export default Button;
