import React from "react";
import vector from "../../assets/success.svg";

export const Frame: React.FC = () => {
  return (
    <div
      className="
        flex flex-col items-center
        w-full max-w-[633px]
        px-5 sm:px-8 md:px-10
        py-6 sm:py-8 md:py-10
        gap-6 sm:gap-8 md:gap-10
        bg-white
        rounded-2xl
        border border-black
        shadow-sm
      "
    >
      {/* Heading */}
      <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
        <p className="text-[16px] sm:text-[20px] md:text-[26px] font-semibold tracking-wide">
          Your account has been created
        </p>
        <p className="text-[16px] sm:text-[20px] md:text-[26px] font-semibold tracking-wide">
          successfully
        </p>
      </div>

      {/* Vector */}
      <img
        src={vector}
        alt="Success"
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
      />

      {/* Subtext */}
      <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
        <p className="text-[14px] sm:text-[16px] md:text-[18px] text-black">
          You are now ready to start guiding
        </p>

        <p className="text-[14px] sm:text-[16px] md:text-[18px]">
          <span className="text-black">
            students and sharing your expertise on
          </span>
          <span className="block mt-2 font-semibold text-[#154d71]">
            EduNest
          </span>
        </p>
      </div>
    </div>
  );
};
