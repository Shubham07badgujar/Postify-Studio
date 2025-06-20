import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white px-8 py-4 shadow-lg rounded-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Page Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Popular Pages
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/about"
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            About Us
          </Link>
          <Link
            to="/services"
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Services
          </Link>
          <Link
            to="/portfolio"
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Portfolio
          </Link>
          <Link
            to="/blog"
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Blog
          </Link>
          <Link
            to="/contact"
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
