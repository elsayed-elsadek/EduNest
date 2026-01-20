import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import './index.css'
import BecomeMentor from './pages/BecomeMentor'
import GetStarted from './pages/GetStarted'
import NotFound from './pages/NotFound'
import { useLocation } from 'react-router-dom'
import Login from "./pages/Login/Login.tsx";
import Register from "./pages/register/Register.tsx";
import { Verify } from "./pages/verifiy/Verify.tsx";
import Success from "./pages/success-register/success.tsx";
import Knowabout from "./pages/mentorinfo/Knowabout.tsx"
import ForgetPass from "./pages/forgetPass/ForgetPass.tsx";
import CheckEmail from "./pages/forgetPass/CheckEmail.tsx";
import ResetPassword from "./pages/forgetPass/ResetPassword.tsx";
import ResetSuccess from "./pages/forgetPass/ResetSuccess.tsx";
// import Dashboard from './pages/Dashboard.tsx'




function App() {
  const location = useLocation();

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
        {/* <Route path="/dash-board" element={<Dashboard />} /> */}

      </Routes>
    </>
  );
}


export default App
