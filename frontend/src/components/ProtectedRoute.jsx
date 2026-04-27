import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const userString = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  // Not logged in -> Redirect to login
  if (!userString || !token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  // If roles are specified and the user's role is not allowed -> Redirect to their respective dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'instructor') return <Navigate to="/instructor-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
