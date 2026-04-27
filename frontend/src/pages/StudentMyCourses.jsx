import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { Compass } from 'lucide-react';
import { studentSidebarLinks } from '../constants/studentSidebarLinks';
import { apiFetch } from '../lib/api';

const StudentMyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const enrollData = await apiFetch('/api/enrollments/me', { auth: true });
        if (cancelled) return;
        setEnrollments(enrollData.enrollments || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load your courses');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const enrolledCourses = useMemo(() => {
    return (enrollments || [])
      .filter((e) => e.course)
      .map((e) => ({
        ...e.course,
        enrolled: true,
        progress: e.progressPercent ?? 0,
      }));
  }, [enrollments]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <Sidebar links={studentSidebarLinks} />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Student</p>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-1">My Courses</h1>
              <p className="mt-1 text-gray-500">
                Courses you’re enrolled in. Browse the catalog to find more.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              Explore catalog
            </Link>
          </div>

          {error && (
            <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-8 text-gray-600 text-center">
                Loading your courses…
              </div>
            ) : enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <CourseCard key={course._id || course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full bg-white rounded-2xl border border-gray-100 border-dashed p-10 text-center">
                <p className="text-lg font-semibold text-gray-900">No enrollments yet</p>
                <p className="text-gray-500 mt-2 mb-6">
                  You haven’t joined any courses. Explore the catalog to get started.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  Explore courses
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMyCourses;
