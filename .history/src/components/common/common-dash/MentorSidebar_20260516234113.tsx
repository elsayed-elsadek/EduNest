

import type { FC } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { useDirectChatUnreadCount } from '../../../hooks/useDirectChatUnreadCount';
import {
  Home as LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  Bell,
  User,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import type { MentorSidebarProps } from "./Mentorside.types";

const MentorSidebar: FC<MentorSidebarProps & { onClose?: () => void }> = ({ onClose }) => {
  const { userName, userAvatar, userEmail, isHydrated } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { unreadCount: unreadMessagesCount } = useDirectChatUnreadCount();

  const firstName = userName?.trim().split(/\s+/)[0] || 'Mentor';

  if (!isHydrated) {
    return <div className="w-64 min-h-screen bg-[var(--sidebar-bg)]" />;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',      path: '/mentor/dashboard'     },
    { icon: BookOpen,        label: 'My Mentorships', path: '/mentor/mentorships'   },
    { icon: Users,           label: 'Students',       path: '/mentor/students'      },
    { icon: MessageSquare,   label: 'Messages',       path: '/mentor/messages'      },
    { icon: MessageSquare,   label: 'Messages',       path: '/mentor/messages', unreadCount: unreadMessagesCount },
    { icon: Bell,            label: 'Notifications',  path: '/mentor/notifications' },
    { icon: User,            label: 'Profile',        path: '/mentor/profile'       },
  ];

  const handleLogout = () => {
    logout();
    onClose?.();
    toast.success('You have been logged out. See you soon!', {
      duration: 2000,
      position: 'top-center',
    });
    navigate('/', { replace: true });
  };

  // Classes مشتركة للـ active/inactive
  const activeCls   = 'bg-[var(--active-bg)] text-[#0d2a4a] ml-4 rounded-l-[50px]';
  const inactiveCls = 'text-white hover:bg-white/5 px-6';

  return (
    <aside className="w-64 min-h-screen bg-[var(--sidebar-bg)] flex flex-col rounded-r-[32px] relative  overflow-hidden">

      {/* Avatar */}
      <div className="pt-8 pb-4 px-6 flex flex-col items-center">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden ring-2 ring-white/20">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={firstName}
                className="w-full h-full object-cover"
                loading="eager"
                key="sidebar-avatar"
              />
            ) : (
              <span className="text-white font-bold text-xl">
                {firstName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--sidebar-bg)] rounded-full" />
        </div>

        <div className="text-center">
          <h3 className="text-white font-bold text-lg">{firstName}</h3>
          <p className="text-gray-400 text-[10px] truncate max-w-[150px]">{userEmail}</p>
        </div>
      </div>

      <div className="mx-8 border-b border-white/5 mb-2" />

      {/* Nav items */}
      <nav className="flex-1 py-2 space-y-1 relative">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-4 py-2.5 transition-all duration-300 ${
                  isActive ? activeCls : inactiveCls
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      <div className="inverted-curve-top" />
                      <div className="inverted-curve-bottom" />
                    </>
                  )}
                  <Icon
                    size={20}
                    className={`relative z-10 ml-2 ${
                      isActive ? 'text-[#0d2a4a]  dark:text-white' : 'text-yellow-400'
                    }`}
                  />
                  <span className={`text-sm font-semibold relative z-10 ${
                    isActive ? 'text-[#0d2a4a] dark:text-white' : 'text-white'
                  }`}>
                    {item.label}
                    <span className="inline-flex items-center gap-2">
                      {item.label}
                      {(item.unreadCount ?? 0) > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full bg-red-500 text-[11px] font-semibold text-white">
                          {(item.unreadCount ?? 0) > 99 ? '99+' : item.unreadCount}
                        </span>
                      )}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="pb-6 space-y-0.5 relative">
        <NavLink
          to="/mentor/settings"
          className={({ isActive }) =>
            `relative flex items-center gap-4 py-2.5 transition-all duration-300 ${
              isActive ? activeCls : inactiveCls
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <>
                  <div className="inverted-curve-top" />
                  <div className="inverted-curve-bottom" />
                </>
              )}
              <SettingsIcon
                size={20}
                className={`relative z-10 ml-2 ${
                  isActive ? 'text-[#0d2a4a]  dark:text-white' : 'text-white'
                }`}
              />
              <span className={`text-sm font-semibold relative z-10 ${
                isActive ? 'text-[#0d2a4a]  dark:text-white' : 'text-white'
              }`}>
                Setting
              </span>
            </>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-2.5 text-white hover:bg-white/5 transition-all duration-300"
        >
          <LogOut size={20} className="text-white rotate-180" strokeWidth={2} />
          <span className="text-sm font-semibold text-white">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default MentorSidebar;