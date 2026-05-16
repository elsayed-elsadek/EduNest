import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Settings, Menu, ChevronDown, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useAdminSettings } from '../../../hooks/admin-roleHooks/Useadminsettings';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const AdminHeader: FC<AdminHeaderProps> = ({ onMenuToggle }) => {
  const navigate      = useNavigate();
  const dropdownRef   = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  //  Auth store 
  const storeUserName   = useAuthStore(s => s.userName);
  const storeUserAvatar = useAuthStore(s => s.userAvatar);
  const logout          = useAuthStore(s => s.logout);

  //  Admin profile 
  const { profile } = useAdminSettings();

  // Prefer profile data → store fallback
  const userName   = profile?.name   || storeUserName   || 'Admin';
  const userAvatar = profile?.avatar || storeUserAvatar || '';
  const userRole   = profile?.headline && profile.headline.trim() !== ''
    ? profile.headline
    : (profile?.role || 'Super Admin');

  const firstName = userName.trim().split(/\s+/)[0];

  //  Avatar with preload (same pattern as StudentNavbar) 
  const [avatarSrc, setAvatarSrc] = useState<string | null>(userAvatar || null);

  useEffect(() => {
    if (!userAvatar) return;
    const img = new Image();
    img.src = userAvatar;
    img.onload = () => setAvatarSrc(userAvatar);
  }, [userAvatar]);

  //  Close dropdown on outside click 
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 shrink-0 bg-white border-b border-gray-100
                       flex items-center justify-between px-4 md:px-6 gap-4">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center
                   text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu size={16} strokeWidth={1.7} />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">

        {/* Settings icon → goes to configurations page */}
        <button
          onClick={() => navigate('/admin/configurations')}
          className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center
                     text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Settings size={15} strokeWidth={1.7} />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2.5 cursor-pointer p-1 rounded-lg
                       hover:bg-gray-50 transition-colors"
          >
            {/* Name + role */}
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                {firstName}
              </p>
              <p className="text-[11px] text-gray-400">{userRole}</p>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0
                            flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold"
                      style={{ background: '#0f5e8b', width: '100%', height: '100%',
                               display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {firstName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <ChevronDown
              size={14}
              className="text-gray-400 transition-transform hidden sm:block"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl
                            border border-gray-100 py-1.5 z-50">
              <Link
                to="/admin/configurations"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50
                           flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" />
                Profile & Settings
              </Link>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => { logout(); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs text-red-600
                           hover:bg-red-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;