import React from "react";

export const ForgetPassHeader: React.FC = () => (
  <div className="flex flex-col gap-2 mb-6 sm:mb-8">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
      Forgot Password?
    </h1>
    <p className="text-sm sm:text-base text-gray-600">
      Don't worry! Enter your email address and we'll send you a link to reset your password.
    </p>
  </div>
);
