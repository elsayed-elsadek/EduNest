import { Link } from "react-router-dom";
import notFoundImg from "../assets/not-found/not-found.svg";

const NotFound = () => {
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

        {/* Back Button */}
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
          style={{ backgroundColor: "var(--primary-500)" }}
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;