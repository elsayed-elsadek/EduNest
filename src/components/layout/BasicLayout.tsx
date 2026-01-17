

import React from "react";
import ImageWithOverlay from "../common/ImageWithOverlay";
import logo from "../../assets/edunestlogo.png";

interface Props {
  children: React.ReactNode;
  scroll?: boolean; 
}

export const BasicLayout: React.FC<Props> = ({ children, scroll = false }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white relative">
      {/* LEFT SIDE */}
      <div
        className="
          w-full md:w-[55%]
          flex flex-col
          flex-1
          bg-white shadow-lg
          relative
          px-4 md:px-10 lg:px-14
          pt-0
          pb-2
          rounded-none md:rounded-r-[50px]
          z-20
          md:-mr-10
          transform md:translate-x-0
          overflow-visible
        "
      >
        <div
          className={
            scroll
              ? "w-full flex flex-col relative ml-0 overflow-y-auto max-h-screen"
              : "w-full flex flex-col relative ml-0"
          }
        >
          {/* logo */}
          <div className="absolute top-0 left-0">
            <img
              src={logo}
              alt="Logo"
              className="w-28 h-28 md:w-40 md:h-40 object-contain"
            />
          </div>

          <div className="mt-20 md:mt-28 w-full">{children}</div>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden md:flex w-full md:w-1/2 h-screen sticky top-0 z-10">
        <ImageWithOverlay />
      </div>
    </div>
  );
};
