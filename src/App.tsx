import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import AdminLayout from './components/admin-components/shared/AdminLayout';
import './index.css';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './routes';
import { queryClient } from './lib/queryClient';
import AdminDashboard from './pages/admin-pages/AdminDashboard/AdminDashboard';
import AdminPayment from './pages/admin-pages/AdminPayment/AdminPayment';

// Lazy load all page components for code splitting
// This significantly reduces initial bundle size and improves FCP/LCP
// Pages with default exports
const Home = lazy(() => import('./pages/Home'));
const BecomeMentor = lazy(() => import('./pages/BecomeMentor'));
const GetStarted = lazy(() => import('./pages/GetStarted'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/register/Register'));
const Success = lazy(() => import('./pages/success-register/success'));
const Knowabout = lazy(() => import('./pages/mentor-pages/mentorinfo/Knowabout'));
const ForgetPass = lazy(() => import('./pages/forgetPass/ForgetPass'));
const CheckEmail = lazy(() => import('./pages/forgetPass/CheckEmail'));
const ResetPassword = lazy(() => import('./pages/forgetPass/ResetPassword'));
const ResetSuccess = lazy(() => import('./pages/forgetPass/ResetSuccess'));
const RestoreAccount = lazy(() => import('./pages/accountRestore/RestoreAccount'));
const ConfirmRestore = lazy(() => import('./pages/accountRestore/ConfirmRestore'));

// Named export - Verify
const Verify = lazy(() => import('./pages/verifiy/Verify').then(m => ({ default: m.Verify })));

// Protected routes - lazy loaded
const MentorDash = lazy(() => import('./pages/mentor-pages/mentordash/MentorDash'));
const MyMentorships = lazy(() => import('./pages/mentor-pages/my-mentorsship-dash/MyMentorsship'));
const StudentsList = lazy(() => import('./pages/mentor-pages/studentspage-mentordash/StudentsList'));
const Messages = lazy(() => import('./pages/mentor-pages/mentorMessages/Messages'));
const NotificationsList = lazy(() => import('./pages/mentor-pages/mentorNotifications/NotificationsList'));
const ProfilePage = lazy(() => import('./pages/mentor-pages/mentorProfile/ProfilePage'));
const Setting = lazy(() => import('./pages/mentor-pages/mentorSettings/Settings'));
const IssuesPage = lazy(() => import('./pages/admin-pages/IssuesPage/IssuesPage'));
const AdminSettings = lazy(() => import('./pages/admin-pages/AdminSettings/AdminSettings'));
const MentorshipDetail = lazy(() => import('./pages/mentor-pages/mentorship-detail/MentorshipDetail'));
const EditMentorship = lazy(() => import('./pages/mentor-pages/edit-mentorship/EditMentorship'));
const StudentProfile = lazy(() => import('./pages/mentor-pages/mentor-view-studentprofile/StudentProfile'));
const CreateMentorship = lazy(() => import('./pages/mentor-pages/create-mentorship/CreateMentorship'));
const MentorshipContent = lazy(() => import('./pages/mentor-pages/mentorship-content/MentorshipContent'));
const MentorshipSessions = lazy(() => import('./pages/mentor-pages/mentorship-sessions/MentorshipSessions'));
const MentorshipQuizzes = lazy(() => import('./pages/mentor-pages/mentorship-quizzes/MentorshipQuizzes'));
const QuizDetail = lazy(() => import('./pages/mentor-pages/mentorship-quizzes/QuizDetail'));
const QuizQuestions = lazy(() => import('./pages/mentor-pages/mentorship-quizzes/QuizQuestions'));
const MentorshipTasks = lazy(() => import('./pages/mentor-pages/mentorship-tasks/MentorshipTasks'));
const TaskDetail = lazy(() => import('./pages/mentor-pages/mentorship-tasks/TaskDetail'));
const MentorshipProjects = lazy(() => import('./pages/mentor-pages/mentorship-projects/MentorshipProjects'));
const ProjectDetail = lazy(() => import('./pages/mentor-pages/mentorship-projects/ProjectDetail'));

// Student Dashboard
const StudentDashboard = lazy(() => import('./pages/student-pages/StudentDashboard/StudentDashboard'));
// const ExploreMentorships = lazy(() => import('./pages/student-pages/ExploreMentorships'));


// Explore Mentorships Page - lazy loaded for code splitting
const ExploreMentorships = lazy(() => import('./pages/student-pages/ExploreMentorships'));
const MentorshipDetailsPage = lazy(() => import('./pages/student-pages/mentorshipDetails/StudentMentorshipDetails'));
const MentorshipOverview = lazy(() => import('./pages/student-pages/mentorshipDetails/OverviewSection'));
const MentorshipContentSection = lazy(() => import('./pages/student-pages/mentorshipDetails/ContentSection'));
const MentorshipReviews = lazy(() => import('./pages/student-pages/mentorshipDetails/ReviewsSection'));
const MentorshipLeaderboard = lazy(() => import('./pages/student-pages/mentorshipDetails/leaderboard/LeaderBoard'));
const MentorProfilePage = lazy(() => import('./pages/student-pages/mentorProfile/MentorProfilePage'));
const MyLearning = lazy(() => import('./pages/student-pages/MyLearning/MyLearning'));
const StudentMentorshipContent = lazy(() => import('./pages/student-pages/studentLearning/StudentMentorshipContent'));
const EnrollMentorship = lazy(() => import('./pages/student-pages/enrollMentorship/EnrollMentorship'));
const StudentMessages = lazy(() => import('./pages/student-pages/Messages/Messages'));
const StudentProfilePage = lazy(() => import('./pages/student-pages/Profile/StudentProfile'));
const StudentSettings = lazy(() => import('./pages/student-pages/Settings/StudentSettings'));
const StudentNotifications = lazy(() => import('./pages/student-pages/Notifications/StudentNotifications'));

// Loading fallback component - minimal to avoid layout shift
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * Determines the dashboard path based on user role
 * @param role The user role
 * @returns The appropriate dashboard path
 */
const getDashboardPath = (role: string): string => {
  switch (role) {
    case 'ROLE_MENTOR':
      return '/mentor/dashboard';
    case 'ROLE_STUDENT':
      return '/student/dashboard';
    case 'ROLE_ADMIN':
      return '/admin/dashboard';
    default:
      return '/mentor/dashboard';
  }
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize app - check for Remember Me on first load
  useEffect(() => {
    const token = useAuthStore.getState().token;
    const rememberMe = useAuthStore.getState().rememberMe;
    const lastEmail = useAuthStore.getState().lastEmail;
    const userRole = useAuthStore.getState().userRole;

    // If user has valid token and Remember Me is enabled, redirect to role-based dashboard
    if (token && rememberMe && lastEmail) {
      const dashboardPath = getDashboardPath(userRole);
      navigate(dashboardPath, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on component mount

  // Only show navbar on home page
  const showNavbar = location.pathname === '/';

  return (
    <QueryClientProvider client={queryClient}>
      {showNavbar && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/become-mentor" element={<BecomeMentor />} />
          <Route path="/start-Started" element={<GetStarted />} />
          <Route path="/mentorships" element={<ExploreMentorships />} />
          <Route path="/mentorships/:mentorshipId" element={<MentorshipDetailsPage />}>
            <Route index element={<MentorshipOverview />} />
            <Route path="content" element={<MentorshipContentSection />} />
            <Route path="reviews" element={<MentorshipReviews />} />
            <Route path="leaderboard" element={<MentorshipLeaderboard />} />
          </Route>
          <Route path="/mentor-profile/:mentorEmail" element={<MentorProfilePage />} />
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
          <Route path="/restore-account" element={<RestoreAccount />} />
          <Route path="/confirm-restore" element={<ConfirmRestore />} />
          
          {/* Protected Mentor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_MENTOR']} />}>
            <Route path="/mentor/dashboard" element={<MentorDash />} />
            <Route path="/mentor/mentorships" element={<MyMentorships />} />
            <Route path="/mentor/mentorships/create" element={<CreateMentorship />} />
            <Route path="/mentor/mentorships/:id" element={<MentorshipDetail />} />
            <Route path="/mentor/mentorships/:id/content" element={<MentorshipContent />} />
            <Route path="/mentor/mentorships/:id/sessions" element={<MentorshipSessions />} />
            <Route path="/mentor/mentorships/:id/quizzes" element={<MentorshipQuizzes />} />
            <Route path="/mentor/mentorships/:id/quizzes/:quizId" element={<QuizDetail />} />
            <Route path="/mentor/mentorships/:id/quizzes/:quizId/questions" element={<QuizQuestions />} />
            <Route path="/mentor/mentorships/:id/tasks" element={<MentorshipTasks />} />
            <Route path="/mentor/mentorships/:id/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/mentor/mentorships/:id/projects" element={<MentorshipProjects />} />
            <Route path="/mentor/mentorships/:id/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/mentor/mentorships/:id/edit" element={<EditMentorship />} />
            <Route path="/mentor/students" element={<StudentsList />} />
            <Route path="/mentor/messages" element={<Messages />} />
            <Route path="/mentor/notifications" element={<NotificationsList />} />
            <Route path="/mentor/profile" element={<ProfilePage />} />
            <Route path="/mentor/students/:id" element={<StudentProfile />} />
            <Route path="/mentor/settings" element={<Setting />} />
          </Route>

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/explore-mentorships" element={<ExploreMentorships />} />
            <Route path="/student/learning" element={<MyLearning />} />
            <Route path="/student/learning/:mentorshipId" element={<StudentMentorshipContent />} />
            <Route path="/mentorships/:mentorshipId/enroll" element={<EnrollMentorship />} />
            <Route path="/student/messages" element={<StudentMessages />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/settings" element={<StudentSettings />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="payment" element={<AdminPayment />} />
              <Route path="issues" element={<IssuesPage />} />
              <Route path="configurations" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;

