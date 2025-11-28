import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { admin, loading } = useContext(AdminContext);

  // Show loading state while checking authentication
  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  // If no admin is logged in, redirect to login
  if (!admin) {
    return <Navigate to="/" replace />;
  }

  // If allowedRoles is specified, check if user has permission
  if (allowedRoles && !allowedRoles.includes(admin.role)) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/admin/dashboard" replace />;
  }

  // User is authenticated and has permission
  return children;
};

export default ProtectedRoute;
