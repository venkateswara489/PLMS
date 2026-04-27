import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  Activity,
  BarChart3,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const InstructorDashboard = () => {
  const sidebarLinks = [
    { name: 'Dashboard', href: '/instructor-dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Course builder', href: '/instructor-dashboard/course-manager', icon: BookOpen },
    { name: 'My Courses', href: '/instructor-dashboard/manage-courses', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings, exact: true },
  ];

  const [items, setItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const [coursesRes, analyticsRes] = await Promise.all([
          apiFetch('/api/instructor/courses', { auth: true }),
          apiFetch('/api/instructor/analytics', { auth: true }),
        ]);
        if (cancelled) return;
        setItems(coursesRes.items || []);
        setAnalytics(analyticsRes);
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

  const statsByCourseId = useMemo(() => {
    const m = {};
    (analytics?.courses || []).forEach((c) => {
      m[String(c.courseId)] = c;
    });
    return m;
  }, [analytics]);

  const avgRating = useMemo(() => {
    if (!items.length) return null;
    return (items.reduce((s, c) => s + (Number(c.avgRating) || 0), 0) / items.length).toFixed(2);
  }, [items]);

  const summary = analytics?.summary;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <Sidebar links={sidebarLinks} />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Instructor Dashboard</h1>
            <p className="mt-1 text-gray-500">
              Manage your courses and track student progress. Use Course builder to create courses and quizzes.
            </p>
          </div>

          {error && (
            <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Unique students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? '…' : summary?.totalUniqueStudents ?? '—'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Across all your courses</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total enrollments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? '…' : summary?.totalEnrollments ?? '—'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Seat enrollments (can repeat)</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? '…' : summary?.avgProgressPercent != null ? `${summary.avgProgressPercent}%` : '—'}
                </p>
                <p className="text-xs text-gray-400 mt-1">All students, all courses</p>
              </div>
              <div className="bg-violet-50 p-3 rounded-xl text-violet-600">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Your courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '…' : items.length}</p>
                <p className="text-xs text-gray-400 mt-1">Avg. rating {avgRating ?? '—'}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl text-green-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your courses</h2>
              <Link
                to="/instructor-dashboard/manage-courses"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-6 text-gray-600">
                  Loading your courses…
                </div>
              ) : items.length > 0 ? (
                items.map((course) => {
                  const cid = String(course._id || course.id);
                  const a = statsByCourseId[cid];
                  const n = a?.enrollmentCount ?? 0;
                  return (
                    <CourseCard
                      key={cid}
                      course={{
                        ...course,
                        instructor: user?.name ? `${user.name} (You)` : 'You',
                        enrolled: true,
                        students: n > 0 ? `${n} enrolled` : '0 enrolled',
                      }}
                    />
                  );
                })
              ) : (
                <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-6 text-gray-600">
                  You haven’t created any courses yet.
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Analytics by course</h2>
                <p className="text-sm text-gray-500">Enrollments and average progress per course</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-gray-600 text-center">Loading analytics…</div>
              ) : (analytics?.courses || []).length === 0 ? (
                <div className="p-8 text-gray-500 text-center">
                  No enrollment data yet. When students enroll, stats will appear here.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Enrolled
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Avg. progress
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Completed (100%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {(analytics?.courses || []).map((row) => (
                      <tr key={String(row.courseId)} className="hover:bg-gray-50/80">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{row.title}</p>
                          <p className="text-xs text-gray-500">{row.category || '—'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              row.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : row.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {row.status || 'draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 tabular-nums">
                          {row.enrollmentCount}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, row.avgProgressPercent || 0)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 tabular-nums w-12 text-right">
                              {row.avgProgressPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-emerald-700 tabular-nums">
                          {row.completedCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <Activity className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent student activity</h2>
                <p className="text-sm text-gray-500">Latest learners and progress</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-gray-600 text-center">Loading…</div>
              ) : !(analytics?.recentActivity || []).length ? (
                <div className="p-8 text-gray-500 text-center">No recent activity yet.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Last activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {(analytics?.recentActivity || []).map((row, idx) => (
                      <tr key={`${row.studentEmail}-${idx}`} className="hover:bg-gray-50/80">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{row.studentName}</p>
                          {row.studentEmail && (
                            <p className="text-xs text-gray-500">{row.studentEmail}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{row.courseTitle}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-sm font-semibold tabular-nums">
                            {row.progressPercent}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600 whitespace-nowrap">
                          {row.lastAccessedAt
                            ? new Date(row.lastAccessedAt).toLocaleString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-indigo-900">
            <p className="font-medium">Summary</p>
            <p className="mt-1 text-indigo-800/90">
              <strong>{summary?.totalCompleted ?? 0}</strong> enrollment
              {summary?.totalCompleted === 1 ? '' : 's'} with 100% progress across your catalog.
              Unique learners: <strong>{summary?.totalUniqueStudents ?? 0}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
