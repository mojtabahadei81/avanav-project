// in client/src/components/UserManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load user data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 1. تغییر: این تابع حالا آمار همه کاربران را ریست می‌کند
  const handleResetAllStats = async () => {
    if (window.confirm('Are you sure you want to reset all stats for ALL users? This action cannot be undone.')) {
      try {
        // 2. تغییر: URL دیگر شامل ID کاربر نیست
        await api.put(`/api/admin/users/reset`);
        alert('All user stats reset successfully!');
        fetchUsers(); // رفرش کردن لیست برای دیدن آمار صفر شده
      } catch (err) {
        alert('Failed to reset stats.');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="loading-spinner">🌀 Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management-container">
      {/* 3. دکمه کلی برای ریست کردن در اینجا اضافه شد */}
      <div className="toolbar">
        <button className="reset-all-btn" onClick={handleResetAllStats}>
          Reset All User Stats
        </button>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Annotations</th>
              <th>Verifications</th>
              {/* 4. ستون Actions حذف شد */}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.stats.annotationsCompleted}</td>
                  <td>{user.stats.verificationsCompleted}</td>
                  {/* 5. دکمه ریست تکی از اینجا حذف شد */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;