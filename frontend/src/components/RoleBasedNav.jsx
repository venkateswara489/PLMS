import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import StudentNav from './StudentNav';
import InstructorNav from './InstructorNav';
import AdminNav from './AdminNav';
import Navbar from './Navbar';

const RoleBasedNav = () => {
  const location = useLocation();
  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  // Use role-specific nav only for protected pages
  const isProtectedPage =
    location.pathname.includes('dashboard') ||
    location.pathname.includes('/course') ||
    location.pathname === '/settings';

  if (!user || !isProtectedPage) {
    return <Navbar />;
  }

  // Enforce role-specific nav by path too for safety (student dashboard should never show course builder)
  if (location.pathname.startsWith('/student-dashboard')) {
    return <StudentNav />;
  }
  if (location.pathname.startsWith('/instructor-dashboard')) {
    return <InstructorNav />;
  }
  if (location.pathname.startsWith('/admin-dashboard')) {
    return <AdminNav />;
  }

  switch (user.role) {
    case 'student':
      return <StudentNav />;
    case 'instructor':
      return <InstructorNav />;
    case 'admin':
      return <AdminNav />;
    default:
      return <Navbar />;
  }
};

export default RoleBasedNav;
