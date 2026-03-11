
import React from "react";
import type { JoinAs } from "../../types/auth";

interface Props {
  joinAs: JoinAs;
  setJoinAs: (v: JoinAs) => void;
}

export const JoinAsToggle: React.FC<Props> = ({ joinAs, setJoinAs }) => {
  const baseStyles =
    "flex-1 sm:flex-auto h-11 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center font-Poppins hover:scale-[1.05] active:scale-95 shadow-sm border-2";

  const activeStyles = "bg-primary text-white shadow-md";
  const inactiveStyles =
    "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50";

  return (
    <div
      className="
        flex flex-row
        gap-2 sm:gap-4
        items-center
        w-full
        justify-start sm:justify-center
      "
    >
      <button
        type="button"
        aria-pressed={joinAs === "student"}
        onClick={() => setJoinAs("student")}
        className={`${baseStyles} ${joinAs === "student" ? activeStyles : inactiveStyles
          }`}
      >
        Student
      </button>

      <button
        type="button"
        aria-pressed={joinAs === "mentor"}
        onClick={() => setJoinAs("mentor")}
        className={`${baseStyles} ${joinAs === "mentor" ? activeStyles : inactiveStyles
          }`}
      >
        Mentor
      </button>
    </div>
  );
};




