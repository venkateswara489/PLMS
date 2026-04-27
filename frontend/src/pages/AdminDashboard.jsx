import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { LayoutDashboard, Users, BookOpen, Settings, BarChart3, ShieldCheck, MoreVertical } from 'lucide-react';
import { apiFetch } from '../lib/api';

const AdminDashboard = () => {
  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Users', href: '/admin-dashboard/users', icon: Users },
    { name: 'Courses', href: '/instructor-dashboard/manage-courses', icon: BookOpen },
    { name: 'Analytics', href: '/admin-dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings, exact: true },
  ];

  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch('/api/admin/overview', { auth: true });
        if (cancelled) return;
        setStats(data.stats || null);
        setRecentUsers(data.recentUsers || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load admin overview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <Sidebar links={sidebarLinks} />
      
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Admin Control Panel</h1>
              <p className="mt-1 text-gray-500">System overview and user management.</p>
            </div>
          </div>

          {error && (
            <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">{stats?.totalUsers ?? '—'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Instructors</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">{stats?.totalInstructors ?? '—'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Published Courses</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">{stats?.publishedCourses ?? '—'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">—</p>
                </div>
              </div>
            </div>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">User</th>
                    <th scope="col" className="px-6 py-4">Role</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Joined</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {loading ? (
                    <tr>
                      <td className="px-6 py-6 text-gray-600" colSpan={5}>Loading users…</td>
                    </tr>
                  ) : recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                              {user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {String(user.role || '').charAt(0).toUpperCase() + String(user.role || '').slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          'bg-green-100 text-green-800'
                        }`}>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 font-medium">
                        <button className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Analytics Overview</h2>
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <BarChart3 className="mx-auto w-12 h-12 text-gray-400 mb-3" />
              <p className="font-medium">System Analytics Placeholder</p>
              <p className="text-sm mt-1">Detailed usage graphs will appear here.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
