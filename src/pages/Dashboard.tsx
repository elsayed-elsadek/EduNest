import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { BasicLayout } from "../components/layout/BasicLayout";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    registrationData,
    logout,
  } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !registrationData) {
      navigate("/register");
    }
  }, [isAuthenticated, registrationData, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userData = user || registrationData;

  return (
    <BasicLayout>
      <div className="mt-10 max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-8 mb-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-lg opacity-90">
            {userData?.firstName} {userData?.lastName}
          </p>
          <p className="text-sm opacity-75 mt-1">
            {userData?.role === "student" ? "Student Account" : "Mentor Account"}
          </p>
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Account Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                First Name
              </label>
              <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                {userData?.firstName}
              </p>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Last Name
              </label>
              <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                {userData?.lastName}
              </p>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email Address
              </label>
              <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                {userData?.email}
              </p>
            </div>

            {/* Phone */}
            {userData?.phone && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Phone Number
                </label>
                <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                  {userData.phone}
                </p>
              </div>
            )}

            {/* Account Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Account Type
              </label>
              <div className="flex gap-2">
                <span className={`px-4 py-2 rounded-full font-semibold text-sm uppercase ${
                  userData?.role === "student"
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
                }`}>
                  {userData?.role === "student" ? "Student" : "Mentor"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Quick Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userData?.role === "student" ? (
              <>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Browse Mentors
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  My Sessions
                </button>
              </>
            ) : (
              <>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Manage Profile
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  View Students
                </button>
              </>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Email Verified</h3>
              <p className="text-sm text-blue-700">Your account has been verified successfully.</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </BasicLayout>
  );
};

export default Dashboard;
