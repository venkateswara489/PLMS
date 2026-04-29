import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import ProgressChart from '../components/ProgressChart';
import RecommendationPanel from '../components/RecommendationPanel';
import { studentSidebarLinks } from '../constants/studentSidebarLinks';
import { apiFetch } from '../lib/api';

const StudentDashboard = () => {

  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [enrollments, setEnrollments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationReason, setRecommendationReason] = useState('');
  const [progressStats, setProgressStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    completionRate: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user._id) {
          throw new Error('User not logged in');
        }

        const [enrollData, recData, progressData] = await Promise.all([
          apiFetch('/api/enrollments/me', { auth: true }),
          apiFetch('/api/recommendations/me', { auth: true }),
          apiFetch(`/api/progress/${user._id}`, { auth: true }),
        ]);
        if (cancelled) return;
        setEnrollments(enrollData.enrollments || []);
        setRecommendations(recData.items || []);
        setRecommendationReason(recData.reason || '');
        setProgressStats({
          totalCourses: progressData.totalCourses || 0,
          completedCourses: progressData.completedCourses || 0,
          completionRate: progressData.avgProgress || 0,
          currentStreak: 0
        });
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load dashboard');
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
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Student dashboard</p>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
                Welcome back, {user?.name || 'Learner'}!
              </h1>
              <p className="mt-1 text-gray-500">Here is what&apos;s happening with your learning journey today.</p>
            </div>
          </div>

          {error && (
            <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-4">
              {error}
            </div>
          )}

          <RecommendationPanel recommendations={recommendations} reason={recommendationReason} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">In Progress Courses</h2>
                  <Link to="/student-dashboard/my-courses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View all</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading ? (
                    <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-6 text-gray-600">
                      Loading your courses…
                    </div>
                  ) : enrolledCourses.length > 0 ? (
                    enrolledCourses.map(course => (
                      <CourseCard key={course._id || course.id} course={course} />
                    ))
                  ) : (
                    <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-6 text-gray-600">
                      You’re not enrolled in any courses yet. Browse the catalog to get started.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Quizzes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-6 text-gray-600">
                    Quiz attempts will appear here once quiz endpoints are enabled for your courses.
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <ProgressChart stats={progressStats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
