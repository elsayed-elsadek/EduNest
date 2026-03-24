import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MentorSidebar from "../common/common-dash/MentorSidebar";
import { MentorNavbar } from "../common/common-dash";
import { useAuthStore } from "../../store/authStore";
import { getMentorProfile, extractMentorProfile } from "../../services/Mentorprofileservice";
import api from "../../services/api";
import { getFirstNameFromToken } from "../../utils/jwt";

const BASE_URL = (() => {
  const url = (api.defaults.baseURL ?? "").replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  return url;
})();

interface DashLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function DashLayout({ children, pageTitle }: DashLayoutProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const token = useAuthStore((s) => s.token);
  const userName = useAuthStore((s) => s.userName);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (token && (!userName?.trim() || userName === 'Mentor')) {
      const name = getFirstNameFromToken(token);
      if (name) setAuth({ token, userName: name });
    }
  }, [token, userName, setAuth]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchProfileIfNeeded = async () => {
      // Get current state to check if we really need to fetch
      const state = useAuthStore.getState();
      if (!state.isHydrated || !token || state.userAvatar) return;

      try {
        const res = await getMentorProfile();
        const data = extractMentorProfile(res);
        if (data) {
          const avatar = data.profileImageUrl
            ? (data.profileImageUrl.startsWith('http')
                ? data.profileImageUrl
                : `${BASE_URL}${data.profileImageUrl}`)
            : undefined;

          const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          
          useAuthStore.setState({
            userName: fullName || useAuthStore.getState().userName,
            userAvatar: avatar ?? useAuthStore.getState().userAvatar,
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile in DashLayout:', err);
      }
    };

    fetchProfileIfNeeded();
  }, [token]);

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-[#f7f7f8] dark:bg-[var(--dark-bg)] overflow-hidden relative transition-colors duration-300">

      {/* 1. Sidebar Container */}
      <div
        className={`
          fixed inset-y-0 left-0 z-[150] w-64 transform 
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto lg:z-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <MentorSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* 2. Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[80] lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        <div className="z-20">
          <MentorNavbar
            pageTitle={pageTitle}
            notificationCount={5}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-2">
          {children}
        </main>
      </div>
    </div>
  );
}



