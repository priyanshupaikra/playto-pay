import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps protected routes. Redirects to /login if not authenticated.
 * Shows a loading state while the auth check is in progress.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="bg-surface-container-lowest text-on-surface min-h-screen flex items-center justify-center">
        <span className="font-data-lg text-data-lg uppercase tracking-widest animate-pulse">
          AUTHENTICATING...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
