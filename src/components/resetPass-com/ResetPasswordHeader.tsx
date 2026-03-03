import React from "react";

export const ResetPasswordHeader: React.FC = () => (
  <div className="flex flex-col gap-2 mb-6 sm:mb-8">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
      Reset your password
    </h1>
    <p className="text-sm sm:text-base text-gray-600">
      Enter a new password to regain access to your account.
    </p>
  </div>
);



