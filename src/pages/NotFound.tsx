import { useNavigate } from "react-router-dom";
import notFoundImg from "../assets/not-found/not-found.svg";


const NotFound = () => {
 const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      <div className="text-center max-w-md w-full">

        {/* Illustration */}
        <div className="flex justify-center">
          <img
            src={notFoundImg}
            alt="Not Found"
            className="w-96 h-96 object-contain"
          />
        </div>

    

        {/* Description */}
        <p className="mt-3 text-gray-500 text-base leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back / Home */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
            style={{ backgroundColor: "var(--primary-500)" }}
          >
            Go home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-medium transition hover:bg-gray-100 border border-gray-300 text-gray-700"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;