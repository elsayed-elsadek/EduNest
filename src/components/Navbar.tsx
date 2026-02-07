import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/edunestlogo.png";

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
  const handleNavClick = (target: string) => {
    setActiveNavItem(target);
    scrollToSection(target);
    setIsOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between bg-[#6FB7D61A] shadow-sm backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer h-10"
            onClick={() => handleNavClick("home")}
          >
         <img className="w-14 h-14 object-fit" src={logo} alt="logo" />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm text-gray-600 flex-1 justify-center">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={`relative transition text-sm ${
                  activeNavItem === item.target
                    ? "text-[#0f5e8b] font-medium"
                    : "hover:text-[#0f5e8b]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            <Link to="/login">
              <button className="text-sm text-gray-600 hover:text-[#0f5e8b] transition font-semibold">
                Sign in
              </button>
            </Link>
            <button
              onClick={() => {
                navigate("/register");
              }}
              className="px-4 py-2 bg-[#0f5e8b] text-white rounded-full text-sm hover:bg-[#0d4a6e] transition"
            >
              Register Now
            </button>
          </div>

          {/* Mobile/medium trigger */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#bcd7ee] text-[#0f5e8b] bg-white/90 shadow-sm"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span
              className={`relative flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
                isOpen ? "bg-[#0f5e8b] text-white" : "bg-transparent"
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
          }`}
        >
          <div className="bg-white/95 shadow-md rounded-2xl px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={`w-full text-left px-2 py-2 text-sm rounded-lg ${
                  activeNavItem === item.target
                    ? "text-[#0f5e8b] bg-[#e3f1fb] font-medium"
                    : "text-gray-700 hover:text-[#0f5e8b] hover:bg-[#e3f1fb]"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-2">
              <Link to="/login">
                <button className="w-full text-sm text-gray-600 text-left hover:text-[#0f5e8b] p-2 font-semibold rounded-lg">
                  Sign in
                </button>
              </Link>
              <button
                onClick={() => {
                  navigate("/register");
                }}
                className="w-full px-3 py-2 bg-[#0f5e8b] text-white rounded-full text-sm hover:bg-[#0d4a6e]"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
