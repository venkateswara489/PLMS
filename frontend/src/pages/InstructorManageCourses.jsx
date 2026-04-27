import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { LayoutDashboard, BookOpen, Users, Settings, Trash2, ArrowLeft, AlertTriangle, BarChart3 } from 'lucide-react';
import { apiFetch } from '../lib/api';

const InstructorManageCourses = () => {
  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const isAdmin = user?.role === 'admin';

  const instructorSidebarLinks = [
    { name: 'Dashboard', href: '/instructor-dashboard', icon: LayoutDashboard, exact: true },
    { name: 'My Courses', href: '/instructor-dashboard/manage-courses', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings, exact: true },
  ];

  const adminSidebarLinks = [
    { name: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Users', href: '/admin-dashboard/users', icon: Users },
    { name: 'Courses', href: '/instructor-dashboard/manage-courses', icon: BookOpen },
    { name: 'Analytics', href: '/admin-dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings, exact: true },
  ];

  const sidebarLinks = isAdmin ? adminSidebarLinks : instructorSidebarLinks;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const loadCourses = useCallback(async () => {
    setError('');
    try {
      const data = isAdmin
        ? await apiFetch('/api/admin/courses', { auth: true })
        : await apiFetch('/api/instructor/courses', { auth: true });
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    setLoading(true);
    loadCourses();
  }, [loadCourses]);

  const handleDelete = async (courseId) => {
    setDeletingId(courseId);
    setError('');
    try {
      await apiFetch(`/api/courses/${courseId}`, { method: 'DELETE', auth: true });
      setConfirmId(null);
      await loadCourses();
    } catch (e) {
      setError(e.message || 'Could not delete course');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <Sidebar links={sidebarLinks} />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                to={isAdmin ? '/admin-dashboard' : '/instructor-dashboard'}
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to dashboard
              </Link>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {isAdmin ? 'Manage all courses' : 'Manage your courses'}
              </h1>
              <p className="mt-1 text-gray-500">
                {isAdmin
                  ? 'Delete any uploaded course. This removes enrollments and cannot be undone.'
                  : 'Delete courses you no longer need. This removes the course and all student enrollments.'}
              </p>
            </div>
            {!isAdmin && (
              <Link
                to="/instructor-dashboard/course-manager"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Course builder
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Admin home
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-600">Loading courses…</div>
            ) : items.length === 0 ? (
              <div className="p-10 text-center text-gray-600">
                <p className="font-medium text-gray-900">No courses yet</p>
                <p className="text-sm mt-1">Create a course in Course builder.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Instructor
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {items.map((course) => {
                      const id = course._id || course.id;
                      const isConfirm = confirmId === id;
                      return (
                        <tr key={id} className="hover:bg-gray-50/80">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{course.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{course.category || '—'}</p>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {course.instructor?.name || '—'}
                              {course.instructor?.email && (
                                <span className="block text-xs text-gray-500">{course.instructor.email}</span>
                              )}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                course.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : course.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {course.status || 'draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {isConfirm ? (
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <span className="text-xs text-gray-600 mr-1">Delete permanently?</span>
                                <button
                                  type="button"
                                  onClick={() => setConfirmId(null)}
                                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingId === id}
                                  onClick={() => handleDelete(id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {deletingId === id ? 'Deleting…' : 'Delete'}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmId(id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorManageCourses;
