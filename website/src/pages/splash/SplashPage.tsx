import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, tryAutoLogin, user, getLoginRedirect } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      // Try auto-login
      const isLoggedIn = await tryAutoLogin();
      
      // Navigate after a short delay for splash effect (2 seconds like Flutter)
      setTimeout(() => {
        if (isLoggedIn) {
          const redirectPath = getLoginRedirect();
          navigate(redirectPath);
        } else {
          navigate('/login');
        }
      }, 2000);
    };

    initializeApp();
  }, [navigate, tryAutoLogin, user, getLoginRedirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {/* Logo Container - 120x120 like Flutter */}
        <div className="mb-8">
          <div className="w-[120px] h-[120px] bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          
          {/* App Title - matching Flutter style */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            MediTrack Pro
          </h1>
          
          {/* Tagline */}
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your Health, Our Priority
          </p>
        </div>

        {/* Loading Indicator - matching Flutter design */}
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
