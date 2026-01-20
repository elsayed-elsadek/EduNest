import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center p-8">
        <h1 className="text-6xl font-extrabold text-gray-800">404</h1>
        <p className="mt-4 text-gray-600 text-lg">Page not found — the link you followed may be broken or the page has been removed.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-3 blueBGColor text-white rounded-lg hover:opacity-90">
          Go back home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
