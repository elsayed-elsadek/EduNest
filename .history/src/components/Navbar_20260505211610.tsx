import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/edunestlogo.png";
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from '../context/useTheme';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { label: "Home", target: "home" },
  { label: "Services", target: "services" },
  { label: "Mentorships", target: "mentorships" },
  { label: "About Us", target: "about" },
  { label: "Blogs", target: "blogs" }

];

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;

  const offset = 90;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior: "smooth" });
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("home");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userName = authStore.userName;
  const handleNavClick = (target: string) => {
    setActiveNavItem(target);
    scrollToSection(target);
    setIsOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between bg-white/5 dark:bg-transparent shadow-sm backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer h-10"
            onClick={() => handleNavClick("home")}
          >
         <img className="w-14 h-14 object-fit" src={logo} alt="logo" />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-300 flex-1 justify-center">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={`relative transition text-sm ${
                  activeNavItem === item.target
                    ? "text-primary font-medium"
                    : "hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 transition"
              aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/mentor/dashboard')}
                  className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">{userName || 'User'}</span>
                </button>
                <button
                  onClick={() => authStore.logout()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded-full text-sm transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-sm text-gray-600 dark:text-gray-200 hover:text-primary transition font-semibold">
                    Sign in
                  </button>
                </Link>
                <button
                  onClick={() => {
                    navigate("/register");
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:opacity-90 transition"
                >
                  Register Now
                </button>
              </>
            )}
          </div>

          {/* Mobile/medium trigger */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-primary bg-white/90 dark:bg-gray-800/90 dark:border-gray-700 shadow-sm"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span
              className={`relative flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
                isOpen ? "bg-primary text-white" : "bg-transparent"
              }`}
            >
              {isOpen ? (
                <span className="text-xs font-semibold">×</span>
              ) : (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="15" y2="18" />
                </svg>
              )}
            </span>
          </button>
        </div>

        {/* Mobile / medium menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-200 ease-out ${
            isOpen ? "max-h-96 mt-2" : "max-h-0"
          }`}>
          <div className="bg-white/95 dark:bg-gray-800/95 shadow-md rounded-2xl px-4 py-4 space-y-2">
          <div className="bg-white/95 shadow-md rounded-2xl px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={`w-full text-left px-2 py-2 text-sm rounded-lg ${
                  activeNavItem === item.target
                    ? "text-primary bg-blue-50 font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-blue-50"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-1 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 transition"
                  aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                {isAuthenticated ? (
                  <>
                    <button
                      className="text-sm text-gray-600 dark:text-gray-200 text-left hover:text-primary p-2 font-semibold rounded-lg flex items-center gap-2"
                      onClick={() => {
                        navigate('/mentor/dashboard');
                        setIsOpen(false);
                      }}
                    >
                      <User className="w-4 h-4" />
                      {userName || 'Dashboard'}
                    </button>
                    <button
                      onClick={() => authStore.logout()}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 p-2 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login">
                    <button className="text-sm text-gray-600 dark:text-gray-200 text-left hover:text-primary p-2 font-semibold rounded-lg">
                      Sign in
                    </button>
                  </Link>
                )}
              </div>
              <button
                onClick={() => {
                  navigate("/register");
                }}
                className="w-full px-3 py-2 bg-primary text-white rounded-full text-sm hover:opacity-90"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
};

export default Navbar;



