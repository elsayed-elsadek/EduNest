import React from "react";
import loginImage from "../../assets/forgetImg.png";
// import RocketIcon from "../../assets/arrowimagewithoverlay.svg"
const ImageWithOverlay: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-gray-100 ">
      {/* image */}
      <img
        src={loginImage}
        alt="Register/Login Background"
        className="w-full h-full  object-cover"
      />

      {/* overlay text */}
     
      {/* <div className="absolute bottom-2 left-4 md:bottom-4 md:left-12">
        <div
          className="
      flex flex-row items-start gap-4 
      p-5 md:p-7 
      rounded-xl 
      backdrop-blur-md bg-white/60 
      shadow-lg 
      max-w-[95%] md:max-w-[650px]
    "
        >
          <p className="text-black text-sm md:text-lg leading-relaxed font-large ">
            Here, you can join mentorship programs, collaborate on projects, and
            track your progress — all in one distraction-free platform.
            <br />
            <br />
          
            Start your journey today, and let your
            <br />
            <span className="flex justify-between items-center w-full mt-1">
              learning take flight!
              <img src={RocketIcon} alt="Rocket" className="w-12 h-12 ml-3" />
            </span>
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default ImageWithOverlay;
