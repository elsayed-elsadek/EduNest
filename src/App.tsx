import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import './index.css'
import BecomeMentor from './pages/BecomeMentor'
import GetStarted from './pages/GetStarted'
import NotFound from './pages/NotFound'
import Login from "./pages/Login/Login.tsx";
import Register from "./pages/register/Register.tsx";
import { Verify } from "./pages/verifiy/Verify.tsx";
import Success from "./pages/success-register/success.tsx";
import Knowabout from "./pages/mentorinfo/Knowabout.tsx"
import ForgetPass from "./pages/forgetPass/ForgetPass.tsx";
import CheckEmail from "./pages/forgetPass/CheckEmail.tsx";
import ResetPassword from "./pages/forgetPass/ResetPassword.tsx";
import ResetSuccess from "./pages/forgetPass/ResetSuccess.tsx";
import MentorDash from './pages/mentordash/MentorDash.tsx';
import MyMentorships from './pages/my-mentorsship-dash/MyMentorsship.tsx';
import StudentsList from './pages/studentspage-mentordash/StudentsList.tsx';
import Messages from './pages/mentorMessages/Messages.tsx';
import NotificationsList from './pages/mentorNotifications/NotificationsList.tsx';
import ProfilePage from './pages/mentorProfile/ProfilePage.tsx';
import Setting from './pages/mentorSettings/Settings.tsx';
import MentorshipDetail from './pages/mentorship-detail/MentorshipDetail.tsx';
import EditMentorship from './pages/edit-mentorship/EditMentorship.tsx';
import StudentProfile from './pages/mentor-view-studentprofile/StudentProfile.tsx'
import { useAuthStore } from './store/authStore.ts';


function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize app - check for Remember Me on first load
  useEffect(() => {
    const token = useAuthStore.getState().token;
    const rememberMe = useAuthStore.getState().rememberMe;
    const lastEmail = useAuthStore.getState().lastEmail;

    // If user has valid token and Remember Me is enabled, redirect to dashboard
    if (token && rememberMe && lastEmail) {
      console.log('🔐 Auto-login enabled - Redirecting to dashboard');
      navigate('/mentor/dashboard', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on component mount

  const showNavbar = ["/"].includes(
    location.pathname
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/become-mentor" element={<BecomeMentor />} />
        <Route path="/start-Started" element={<GetStarted />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/success" element={<Success />} />
        <Route path="/know-about" element={<Knowabout />} />
        <Route path="/forgot-password" element={<ForgetPass />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />
        <Route path="/mentor/dashboard" element={<MentorDash />} />
        <Route path="/mentor/mentorships" element={<MyMentorships />} />
        <Route path="/mentor/mentorships/:id" element={<MentorshipDetail />} />
        <Route path="/mentor/mentorships/:id/edit" element={<EditMentorship />} />
        <Route path="/mentor/students" element={<StudentsList />} />
        <Route path="/mentor/messages" element={<Messages />} />
        <Route path="/mentor/notifications" element={<NotificationsList />} />
        <Route path="/mentor/profile" element={<ProfilePage />} />
        <Route path="/mentor/settings" element={<Setting />} />
                 
  <Route path="/mentor/students/:id" element={<StudentProfile />} />
             
        
         
        {/* <Route path="/dash-board" element={<Dashboard />} /> */}

      </Routes>
    </>
  );
}


export default App;
