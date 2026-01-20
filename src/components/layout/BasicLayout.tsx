import React from "react";
import ImageWithOverlay from "../common/ImageWithOverlay";
import logo from "../../assets/edunestlogo.png";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

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
          bg-white shadow-none md:shadow-lg
          relative
          px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12
         
          pb-6 sm:pb-8 md:pb-4
          rounded-none md:rounded-r-[50px]
          z-20
          md:-mr-10
          overflow-visible
        "
      >
        <div
          className={
            scroll
              ? "w-full flex flex-col relative overflow-y-auto max-h-screen"
              : "w-full flex flex-col relative"
          }
        >
          {/* logo */}
          <Link to="/" className="inline-block mb-6 sm:mb-8 md:mb-10 hover:opacity-80 transition-opacity duration-200 w-1/4">
            <img
              src={logo}
              alt="Logo"
              className="w-16 h-20  object-contain "
            />
          </Link>

          <div className="w-full">{children}</div>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden md:flex w-full md:w-1/2 h-screen sticky top-0 z-10">
        <ImageWithOverlay />
      </div>

      <Toaster
  position="top-center"
  reverseOrder={false}
  toastOptions={{
    duration: 4000,
    success: {
      className: 'bg-white text-green-800 border border-green-100',
    },
    error: {
      className: 'bg-white text-red-800 border border-red-100',
    },
  }}
/>


    </div>
  );
};