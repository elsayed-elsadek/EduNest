// import React from "react";
// import ImageWithOverlay from "../../components/common/ImageWithOverlay";
// import logo from "../../assets/edunestlogo.png";

// interface Props {
//   children: React.ReactNode;
// }

// export const VerifyLayout: React.FC<Props> = ({ children }) => {
//   return (
//     <div className="flex flex-col md:flex-row min-h-screen w-full bg-white relative">
//       {/* LEFT SIDE */}
//       <div
//         className="
//           w-full md:w-1/2
//           flex flex-col
//           bg-white shadow-lg
//           relative
//           px-4 md:px-10 lg:px-14   /* padding على الجوانب فقط */
//           pt-0                     /* مفيش padding فوق */
//           pb-2                     /* padding تحت */
//           rounded-none md:rounded-r-[50px]
//         "
//       >
        
//           <div className="w-full flex flex-col relative ml-0">
 
//   <div className="absolute top-0 left-0">
//     <img
//       src={logo}
//       alt="Logo"
//       className="w-28 h-28 md:w-40 md:h-40 object-contain"
//     />
//   </div>

         
//           <div className="mt-20 md:mt-28 w-full">{children}</div>
//         </div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="hidden md:flex w-full md:w-1/2">
//         <ImageWithOverlay />
//       </div>
//     </div>
//   );
// };




// tooooooooooooodoo



// import React from "react";
// import ImageWithOverlay from "../common/ImageWithOverlay";
// import logo from "../../assets/edunestlogo.png";

// interface Props {
//   children: React.ReactNode;
// }

// export const BasicLayout: React.FC<Props> = ({ children }) => {
//   return (
//     <div className="relative w-full min-h-screen bg-white overflow-y-auto">
//       {/* RIGHT SIDE IMAGE */}
//       <div className="hidden md:flex absolute inset-0 w-full h-full">
//         <ImageWithOverlay />
//       </div>

//       {/* DARK OVERLAY */}
//       <div className="hidden md:block absolute inset-0 bg-black/20"></div>

//       {/* LEFT WHITE CARD */}
//       <div
//         className="
//           absolute top-0 left-0
//           w-full md:w-[760px]
//           min-h-screen
//           bg-white
//           shadow-[0px_4px_25px_rgba(0,0,0,0.1)]
//           rounded-none md:rounded-r-[70px]
//           z-30
//           px-6 md:px-14
//           pt-4
//           flex flex-col
//         "
//       >
//         {/* LOGO */}
//         <div className="absolute top-6 left-6 md:top-8 md:left-12">
//           <img
//             src={logo}
//             alt="Logo"
//             className="w-28 h-28 md:w-40 md:h-40 object-contain"
//           />
//         </div>

//         {/* FORM CONTENT */}
//         <div className="mt-40 md:mt-56 w-full">{children}</div>
//       </div>
//     </div>
    
//   );
// };