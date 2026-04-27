import { LayoutDashboard, BookOpen, Compass, Settings } from 'lucide-react';

/** Shared student sidebar — My Courses = enrolled only; Explore = full catalog */
export const studentSidebarLinks = [
  { name: 'Dashboard', href: '/student-dashboard', icon: LayoutDashboard, exact: true },
  { name: 'My Courses', href: '/student-dashboard/my-courses', icon: BookOpen },
  { name: 'Explore', href: '/courses', icon: Compass, exact: true },
  { name: 'Settings', href: '/settings', icon: Settings, exact: true },
];
