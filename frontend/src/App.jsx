/**
 * App.jsx — Root application with React Router and global providers
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import ChatPage           from './pages/ChatPage';
import ConfirmationPage   from './pages/ConfirmationPage';
import DashboardPage      from './pages/DashboardPage';
import FeedbackDetailPage from './pages/FeedbackDetailPage';
import FeedbackListPage   from './pages/FeedbackListPage';
import SettingsPage       from './pages/SettingsPage';

// Renders Navbar only on non-landing/non-login routes
function ConditionalNavbar() {
  const { pathname } = useLocation();
  if (pathname === '/' || pathname === '/login') return null;
  return <Navbar />;
}

function AppRoutes() {
  return (
    <>
      <ConditionalNavbar />
      <Routes>
        {/* Public routes */}
        <Route path="/"             element={<LandingPage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/chat"         element={<ChatPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />

        {/* Manager-only protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="manager">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback-list"
          element={
            <ProtectedRoute requiredRole="manager">
              <FeedbackListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback/:id"
          element={
            <ProtectedRoute requiredRole="manager">
              <FeedbackDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRole="manager">
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E2A42',
              color: '#E8ECF4',
              border: '1px solid rgba(255,255,255,0.07)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#2EC4B6', secondary: '#0F1420' } },
            error:   { iconTheme: { primary: '#FF5B5B', secondary: '#0F1420' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
