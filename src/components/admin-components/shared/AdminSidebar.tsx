import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard,
  AlertCircle, Settings, LogOut, X,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import logo from '../../../assets/edunestlogo.png';

const NAV_ITEMS = [
  { to: '/admin/dashboard',      label: 'Dashboard',      Icon: LayoutDashboard },
  { to: '/admin/users',          label: 'Users',          Icon: Users           },
  { to: '/admin/payment',        label: 'Payment',        Icon: CreditCard      },
  { to: '/admin/issues',         label: 'Issues',         Icon: AlertCircle     },
  { to: '/admin/configurations', label: 'Configurations', Icon: Settings        },
] as const;

interface AdminSidebarProps {
  isOpen   : boolean;
  onClose  : () => void;
}

const AdminSidebar: FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    onClose();
    logout();
  };

  const sidebar = (
    <aside className="w-[220px] shrink-0 flex flex-col bg-white border-r border-gray-100 h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <img src={logo} alt="EduNest Logo" className="w-20 h-16 rounded-lg object-contain" />
        {/* Close btn — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center
                     text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13.5px] font-medium
               transition-colors w-full
               ${isActive
                 ? 'text-[#0f5e8b] bg-[#e8f3fa] font-semibold'
                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-[#0f5e8b]' : 'text-gray-400'} strokeWidth={1.7} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2.5 py-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13.5px]
                     font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut size={16} className="text-red-500" strokeWidth={1.7} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden md:flex h-full">
        {sidebar}
      </div>

      {/* Mobile — drawer + overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative z-10 h-full flex">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;