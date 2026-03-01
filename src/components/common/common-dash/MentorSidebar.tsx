
import type { FC } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
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
  // اسحب القيم دي من الـ Store
  const { userName, userAvatar, userEmail, isHydrated } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const firstName = userName?.trim().split(/\s+/)[0] || 'Mentor';

  // لو الـ Store لسه بيحمل البيانات من الـ LocalStorage، ممكن تظهر Loader بسيط أو ترجع null
  if (!isHydrated) {
    return <div className="w-64 min-h-screen bg-[#0c2d48]" />; // مستطيل فارغ بنفس لون السايدبار
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor/dashboard' },
    { icon: BookOpen, label: 'My Mentorships', path: '/mentor/mentorships' },
    { icon: Users, label: 'Students', path: '/mentor/students' },
    { icon: MessageSquare, label: 'Messages', path: '/mentor/messages' },
    { icon: Bell, label: 'Notifications', path: '/mentor/notifications' },
    { icon: User, label: 'Profile', path: '/mentor/profile' },
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

  return (
    <aside className="w-64 min-h-screen bg-[#0c2d48] flex flex-col rounded-r-[32px] relative overflow-hidden">
{/* 
    avatar */}
      <div className="pt-8 pb-4 px-6 flex flex-col items-center">
        <div className="relative mb-3">
        
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden ring-2 ring-white/20">
            {/* استخدم userAvatar من الـ Store مباشرة */}
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
          {/* state */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0c2d48] rounded-full"></div>
        </div>

        <div className="text-center">
          <h3 className="text-white font-bold text-lg">{userName || 'Mentor'}</h3>
          <p className="text-gray-400 text-[10px] truncate max-w-[150px]">{userEmail}</p>
        </div>
      </div>

      <div className="mx-8 border-b border-white/5 mb-2"></div>

      <nav className="flex-1 py-2 space-y-1 relative">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                relative flex items-center gap-4 py-2.5 transition-all duration-300
                ${isActive
                  ? 'bg-[#F7F7F8] text-[#0c2d48] ml-4 rounded-l-[50px]'
                  : 'text-[#d4af37] hover:bg-white/5 px-6'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      <div className="inverted-curve-top"></div>
                      <div className="inverted-curve-bottom"></div>
                    </>
                  )}
                  <Icon size={20} className={`relative z-10 ${isActive ? 'ml-2 text-[#0c2d48]' : 'text-[#d4af37]'}`} />
                  <span className={`text-sm font-semibold relative z-10 ${isActive ? 'text-[#0c2d48]' : 'text-white'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="pb-6 space-y-0.5 relative">
        <NavLink
          to="/mentor/settings"
          className={({ isActive }) => `
            relative flex items-center gap-4 py-2.5 transition-all duration-300
            ${isActive
              ? 'bg-[#F7F7F8] text-[#0c2d48] ml-4 rounded-l-[50px]'
              : 'text-[#d4af37] hover:bg-white/5 px-6'
            }
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <>
                  <div className="inverted-curve-top"></div>
                  <div className="inverted-curve-bottom"></div>
                </>
              )}
              <SettingsIcon
                size={20}
                className={`relative z-10 ${isActive ? 'ml-2 text-[#0c2d48]' : 'text-white'}`}
              />
              <span className={`text-sm font-semibold relative z-10 ${isActive ? 'text-[#0c2d48]' : 'text-white'}`}>
                Setting
              </span>
            </>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-2.5 text-[#d4af37] hover:bg-white/5 transition-all duration-300"
        >
          <LogOut size={20} className="text-white rotate-180" strokeWidth={2} />
          <span className="text-sm font-semibold text-white">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default MentorSidebar;