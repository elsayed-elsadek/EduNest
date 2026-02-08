
import { useState, type FC } from 'react';
import DashLayout from '../../components/layout/Dash-layout';
import SettingItem from '../../components/mentor-setting-com/SettingItem';
import SettingToggle from '../../components/mentor-setting-com/SettingToggle';
import { Mail, Lock, Bell, Moon, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import type { SettingsData } from '../../types/mentor-settings.types';

const Settings: FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    email: 'Johnsmith@gmail.com',
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    darkMode: false,
    messageNotifications: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = (key: keyof SettingsData) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEditEmail = () => console.log('Edit email clicked');
  const handleChangePassword = () => console.log('Change password clicked');
  const handleDeleteAccount = () => setShowDeleteConfirm(true);

  return (
    <DashLayout pageTitle="Settings">

      <div className="bg-[#F7F8FA] min-h-screen py-6 px-4 md:py-10 md:px-16">

        <div className="max-w-[1400px] mx-auto bg-white rounded-2xl md:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">

          {/* Header: */}
          <div className="bg-white border-b border-gray-100 px-6 py-6 md:px-12 md:py-8">
            <h1 className="text-xl md:text-2xl font-bold text-[#1A1C1E]">
              Account Setting
            </h1>
          </div>

          <div className="p-4 md:p-12">
            <div className="max-w-5xl space-y-4">

              {/* Email Address */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 hover:bg-gray-50/50 transition-colors">
                <SettingItem
                  label="Email address"
                  description="the email address associated with your account"
                  value={settings.email}
                  icon={<Mail className="w-5 h-5" />}
                  actionButton={
                    <button
                      onClick={handleEditEmail}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-[#33A1E0]" />
                    </button>
                  }
                />
              </div>

              {/* Password */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 hover:bg-gray-50/50 transition-colors">
                <SettingItem
                  label="Password"
                  description="Set a unique password to protect your account"
                  value=""
                  icon={<Lock className="w-5 h-5" />}
                  actionButton={
                    <button
                      onClick={handleChangePassword}
                      className="whitespace-nowrap px-4 py-2 text-[12px] md:text-sm font-bold text-[#33A1E0] border border-blue-100 rounded-xl hover:bg-[#33A1E0] hover:text-white transition-all"
                    >
                      Change Password
                    </button>
                  }
                />
              </div>

              {/* Notifications Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 space-y-1">
                <SettingToggle
                  label="Email Notifications"
                  description="Receive notifications via email"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  icon={<Mail className="w-5 h-5" />}
                />
                <SettingToggle
                  label="Push Notifications"
                  description="Receive push notifications in browser"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  icon={<Bell className="w-5 h-5" />}
                />
                <SettingToggle
                  label="Weekly Digest"
                  description="Get a summary of your weekly activity"
                  checked={settings.weeklyDigest}
                  onChange={() => handleToggle('weeklyDigest')}
                  icon={<MessageSquare className="w-5 h-5" />}
                />
                <SettingToggle
                  label="Dark Mode"
                  description="Switch between light and dark"
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                  icon={<Moon className="w-5 h-5" />}
                />
              </div>

              {/* Delete Account: */}
              <div className="bg-red-50/30 rounded-2xl border border-red-100 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="p-3 bg-red-50 rounded-2xl flex-shrink-0">
                      <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Delete Account
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-md leading-relaxed">
                        This will delete your account. Your account will be permanently deleted from EduNest.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-red-500 border border-red-200 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-center"
                  >
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal:  */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 mb-8">Are you sure? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 text-sm font-bold text-white bg-red-500 rounded-xl shadow-lg shadow-red-100 order-1 sm:order-2">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashLayout>
  );
};

export default Settings;