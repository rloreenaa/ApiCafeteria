import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner fullscreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (requiredRole === 'admin' && !isAdmin) return <Navigate to="/catalog" replace />;
  if (requiredRole === 'student' && isAdmin) return <Navigate to="/admin" replace />;

  return <Outlet />;
}
