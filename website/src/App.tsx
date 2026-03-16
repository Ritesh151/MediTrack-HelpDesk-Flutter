import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { initializeTheme } from './store/themeStore';

// Pages
import SplashPage from './pages/splash/SplashPage';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperDashboard from './pages/super/SuperDashboard';
import TicketDetailsPage from './pages/tickets/TicketDetailsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Guard Component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Role Guard Component
const RoleGuard: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => {
  const { user } = useAuthStore();
  
  if (!user || !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'patient') return <Navigate to="/patient" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'super') return <Navigate to="/super" replace />;
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'patient') return <Navigate to="/patient" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'super') return <Navigate to="/super" replace />;
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Role Based Redirect Component
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuthStore();
  
  if (user?.role === 'patient') return <Navigate to="/patient" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'super') return <Navigate to="/super" replace />;
  return <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { tryAutoLogin } = useAuthStore();

  useEffect(() => {
    // Initialize theme system
    initializeTheme();
    
    // Try auto-login
    tryAutoLogin();
  }, [tryAutoLogin]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/splash" element={<SplashPage />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Patient Routes */}
        <Route path="/patient" element={
          <AuthGuard>
            <RoleGuard roles={['patient']}>
              <DashboardLayout>
                <PatientDashboard />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AuthGuard>
            <RoleGuard roles={['admin', 'super']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        } />

        {/* Super Admin Routes */}
        <Route path="/super" element={
          <AuthGuard>
            <RoleGuard roles={['super']}>
              <DashboardLayout>
                <SuperDashboard />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        } />

        {/* Ticket Routes */}
        <Route path="/tickets/:id" element={
          <AuthGuard>
            <DashboardLayout>
              <TicketDetailsPage />
            </DashboardLayout>
          </AuthGuard>
        } />

        {/* Settings Routes */}
        <Route path="/settings" element={
          <AuthGuard>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </AuthGuard>
        } />

        {/* Catch all route */}
        <Route path="*" element={
          <AuthGuard>
            <RoleBasedRedirect />
          </AuthGuard>
        } />
      </Routes>
    </div>
  );
};

export default App;
