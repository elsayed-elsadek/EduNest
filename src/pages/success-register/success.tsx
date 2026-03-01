import React from "react";
import { useNavigate } from "react-router-dom";

import { BasicLayout } from "../../components/layout/BasicLayout";
import { Frame } from "../../components/success-com/Frame";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Success: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    const registrationType = localStorage.getItem("registrationType");
    if (registrationType === "mentor") {
      navigate("/mentor/dashboard");
    } else {
      navigate("/dashboard");
    }
    localStorage.removeItem("registrationType");
  };

  return (
    <BasicLayout>
      <div className="w-full h-[70vh] sm:h-[80vh] lg:h-[70vh] flex flex-col justify-center items-center px-4 sm:px-6 md:px-8">
        
        {/* Frame */}
        <div className="w-full flex justify-center mb-5 sm:mb-8 md:mb-4">
          <Frame />
        </div>

        {/* Button Wrapper */}
        <div className="w-full max-w-3xl flex justify-center sm:justify-end">
          <button
            onClick={handleNext}
            className="
              group
              flex items-center justify-center gap-3
              w-full sm:w-[180px] h-[52px] sm:h-[56px] md:h-[60px]
              rounded-2xl
              bg-[#1c6ea4]
              border border-transparent
              shadow-md
              transition-all duration-300 ease-in-out
              hover:bg-white hover:border-[#1c6ea4] hover:shadow-lg
              active:scale-95
            "
          >
            <span
              className="
                text-[15px] sm:text-[16px] md:text-[18px]
                font-semibold
                tracking-wide
                text-white
                transition-colors duration-300
                group-hover:text-[#1c6ea4]
              "
            >
              Next
            </span>

           <FontAwesomeIcon icon={faArrowRight} className=" text-white group-hover:text-[#1c6ea4]  w-4 h-4 sm:w-5 sm:h-5
                transition-transform duration-300
                group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </BasicLayout>
  );
};

export default Success;
