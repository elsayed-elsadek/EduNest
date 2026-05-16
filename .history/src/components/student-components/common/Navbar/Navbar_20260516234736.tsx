
import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { theme } from '../../../../theme/colors';
import edunestLogo from '../../../../assets/edunestlogo.png';
import { useStudentProfile } from '../../../../hooks/student-roleHooks/Usestudentprofile';
import { useNotifications } from '../../../../hooks/Usenotifications';
import { useDirectChatUnreadCount } from '../../../../hooks/useDirectChatUnreadCount';

interface NavbarProps {
  userName?:   string;
  userAvatar?: string;
}

const Navbar: FC<NavbarProps> = ({ userName: nameProp, userAvatar: avatarProp }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location  = useLocation();
  const navigate  = useNavigate();

  const storeUserName   = useAuthStore(s => s.userName);
  const storeUserAvatar = useAuthStore(s => s.userAvatar);
  const logout          = useAuthStore(s => s.logout);

  // ── Fetch student profile for avatar ────────────────────────────────────
  const { profile: profileData } = useStudentProfile();

  // ── Notifications ──────────────────────────────────────────────────────
  const { unreadCount } = useNotifications();
  const { unreadCount: unreadMessagesCount } = useDirectChatUnreadCount();

  const userName   = nameProp   || storeUserName   || 'Student';
  const userAvatar = avatarProp || profileData?.avatar || storeUserAvatar || '';

  // ── Avatar caching (same pattern as MentorNavbar) ───────────────────────
  const [avatarSrc, setAvatarSrc] = useState<string | null>(userAvatar || null);

  useEffect(() => {
    if (!userAvatar) return;
    const img = new Image();
    img.src = userAvatar;
    img.onload = () => setAvatarSrc(userAvatar);
  }, [userAvatar]);

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = userName.trim().split(/\s+/)[0];

  const navItems = [
    { label: 'Home',        path: '/student/dashboard'   },
    { label: 'Mentorships', path: '/explore-mentorships' },
    { label: 'Learning',    path: '/student/learning'    },
<<<<<<< HEAD
    { label: 'Messages',    path: '/student/messages'    },
=======
    { label: 'Messages',    path: '/student/messages', unreadCount: unreadMessagesCount },
>>>>>>> Student-role
    { label: 'Profile',     path: '/student/profile'     },
    { label: 'Settings',    path: '/student/settings'    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/student/dashboard" className="flex items-center gap-0">
            <img src={edunestLogo} alt="EduNest Logo" className="w-14 h-12" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                  isActive(item.path)
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
<<<<<<< HEAD
                {item.label}
=======
                <span className="inline-flex items-center gap-2">
                  {item.label}
                  {(item.unreadCount ?? 0) > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full bg-red-500 text-[11px] font-semibold text-white">
                      {(item.unreadCount ?? 0) > 99 ? '99+' : item.unreadCount}
                    </span>
                  )}
                </span>
>>>>>>> Student-role
                {isActive(item.path) && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                    style={{ background: theme.primary[500] }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': theme.primary[500] } as React.CSSProperties}
              />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/student/notifications')}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(v => !v)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* ── Cached Avatar ── */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: theme.gradients.studentHero }}>
                      <span className="text-white text-xs font-bold">
                        {firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-900 max-w-[120px] truncate">
                  {firstName}
                </span>
                <ChevronDown
                  className="hidden md:block w-4 h-4 text-gray-500 transition-transform"
                  style={{ transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <Link
                    to="/student/profile"
                    className="px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <User className="w-3.5 h-3.5" />
                    View Profile
                  </Link>
                  <Link
                    to="/student/settings"
                    className="px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
<<<<<<< HEAD
                {item.label}
=======
                <span className="inline-flex items-center justify-between w-full gap-2">
                  {item.label}
                  {(item.unreadCount ?? 0) > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full bg-red-500 text-[11px] font-semibold text-white">
                      {(item.unreadCount ?? 0) > 99 ? '99+' : item.unreadCount}
                    </span>
                  )}
                </span>
>>>>>>> Student-role
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;