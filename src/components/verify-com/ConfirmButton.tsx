import React from "react";

interface Props {
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ConfirmButton: React.FC<Props> = ({
  loading,
  onClick,
  disabled,
}) => {
  return (
    <button
      className="px-6 py-3 mt-4 rounded-lg bg-gradient-to-r from-[#154d71] to-[#33a1e0] 
                 text-white font-semibold text-sm 
                 hover:opacity-90 transition
                 disabled:opacity-60 disabled:cursor-not-allowed
                 w-auto mx-auto flex items-center justify-center"
      onClick={onClick}
      disabled={loading || disabled} 
    >
      {loading ? "Loading..." : "Confirm and proceed"}
    </button>
  );
};
