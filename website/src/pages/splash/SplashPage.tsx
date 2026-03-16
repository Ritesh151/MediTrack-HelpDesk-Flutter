import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, tryAutoLogin } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      // Try auto-login
      const isLoggedIn = await tryAutoLogin();
      
      // Navigate after a short delay for splash effect
      setTimeout(() => {
        if (isLoggedIn) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      }, 2000);
    };

    initializeApp();
  }, [navigate, tryAutoLogin, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MediTrack Pro</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Healthcare HelpDesk System</p>
        </div>

        {/* Loading animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        {/* Loading text */}
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Loading your experience...
        </p>
      </div>
    </div>
  );
};

export default SplashPage;
