import React, { useState, useEffect, useCallback } from 'react';
import { User, Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadUser = useCallback(async () => {
    setError('');
    try {
      const data = await apiFetch('/api/users/me', { auth: true });
      const u = data.user;
      if (!u) return;
      setName(u.name || '');
      setEmail(u.email || '');
      setRole(u.role || '');
      setBio(u.profile?.bio || '');
      setInterests(Array.isArray(u.profile?.interests) ? u.profile.interests.join(', ') : '');
    } catch (e) {
      if (e.status === 401) {
        navigate('/login');
        return;
      }
      setError(e.message || 'Could not load your settings');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Refresh when tab becomes visible (keeps UI in sync with DB)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') loadUser();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadUser]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSavingProfile(true);
    try {
      const interestList = interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const data = await apiFetch('/api/users/me', {
        method: 'PATCH',
        auth: true,
        body: {
          name,
          profile: { bio, interests: interestList },
        },
      });
      const u = data.user;
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...stored,
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
        })
      );
      setMessage('Profile saved.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await apiFetch('/api/users/me/password', {
        method: 'PATCH',
        auth: true,
        body: { currentPassword, newPassword },
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password updated.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Password update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {(message || error) && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm ${
              error ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'profile' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'security' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Security</span>
            </button>
          </div>

          <div className="flex-1 p-8 md:p-10 bg-white">
            {activeTab === 'profile' && (
              <form onSubmit={saveProfile} className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Profile Information</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Data is loaded from your account and saved to the database.
                  </p>
                </div>

                <div className="flex items-center space-x-6 mb-6">
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-lg">
                    {initial}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700 capitalize">{role || 'user'}</span>
                    <p className="mt-1">Avatar upload can be added later.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email is tied to your login and cannot be changed here.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Write a few sentences about yourself..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interests (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. Web Development, Data Science"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used for personalized course recommendations.</p>
                  </div>
                </div>

                <div className="flex justify-end mt-8 border-t pt-6">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors shadow-sm disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={savePassword} className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Security Settings</h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start space-x-4">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-factor Authentication</h4>
                    <p className="text-sm text-gray-500 mt-1">Coming soon — optional extra security.</p>
                  </div>
                </div>

                <div className="flex justify-end mt-8 border-t pt-6">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors shadow-sm disabled:opacity-60"
                  >
                    {savingPassword ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
