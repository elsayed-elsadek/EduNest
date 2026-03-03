import React from "react";
import { Link, useNavigate } from "react-router-dom";
import resetImg from "../../assets/resetPass.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/edunestlogo.png";

const ResetSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (

    
    <div className="min-h-screen flex flex-col-reverse lg:flex-row w-full justify-center relative">
  {/* logo */}
          <Link to="/" className="inline-block absolute top-4 md:top-8 left-4 md:left-12  hover:opacity-80 transition-opacity duration-200">
            <img
              src={logo}
              alt="Logo"
              className="w-20 h-20 object-contain"
            />
          </Link>

      {/* Left Side - Text Content */}
      <div className="flex flex-col gap-6 w-full lg:w-1/2 items-center justify-center px-4 sm:px-6 py-8 lg:py-0">
        {/* Success Icon */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-4 lg:flex items-center justify-center hidden">
          <FontAwesomeIcon icon={faCheck} className="blueBGColor rounded-full p-3 sm:p-4 text-white text-lg sm:text-xl lg:text-2xl"/>
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-6 max-w-sm sm:max-w-md text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Reset successful !!
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
            Your password has been successfully changed. You can now sign in with your new password.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => navigate("/login")}
          className="
            w-full max-w-sm sm:max-w-md
            h-10 sm:h-12 lg:h-14
            rounded-lg sm:rounded-xl
            btn-primary-gradient
            text-white
            font-semibold
            text-xs sm:text-sm lg:text-base
            shadow-md
            transition-all duration-300
            hover:scale-[1.02] hover:shadow-lg hover:-translate-y-0.5
            active:scale-95 active:translate-y-0
          "
        >
          Back to Login
        </button>
      </div>

      {/* Right Side - Image */}
      <div className="lg:flex w-[400px] lg:w-1/2 h-[400px] sm:h-96 lg:h-screen overflow-hidden mx-auto">
        <img
          src={resetImg}
          alt="Reset Password Success"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ResetSuccess; 


