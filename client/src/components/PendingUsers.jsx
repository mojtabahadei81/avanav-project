// in src/components/PendingUsers.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import './UserManagement.css'; // از استایل‌های مشابه استفاده می‌کنیم

function PendingUsers({ onUserApproved }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null); // برای نمایش لودینگ روی دکمه

  const fetchPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/pending-users');
      setPendingUsers(data);
      setError('');
    } catch (err) {
      setError('بارگذاری کاربران در انتظار تایید ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleApprove = async (userId) => {
    setApprovingId(userId); // دکمه مربوط به این کاربر لودینگ می‌شود
    try {
      await api.put(`/api/admin/approve-user/${userId}`);
      alert('کاربر با موفقیت تایید شد.');
      // لیست کاربران را دوباره بارگذاری می‌کنیم تا کاربر تایید شده حذف شود
      fetchPendingUsers();
      onUserApproved(); // به پنل ادمین اطلاع می‌دهیم تا لیست کلی کاربران را هم رفرش کند
    } catch (err) {
      alert('تایید کاربر ناموفق بود.');
    } finally {
      setApprovingId(null); // لودینگ تمام شد
    }
  };

  if (loading) return <div className="loading-spinner">🌀 در حال بارگذاری...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management-container">
       <h3 className="section-title">کاربران در انتظار تایید</h3>
      {pendingUsers.length === 0 ? (
        <p className="no-data-message">در حال حاضر هیچ کاربری در انتظار تایید نیست.</p>
      ) : (
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>نام</th>
                <th>نام خانوادگی</th>
                <th>شماره تلفن</th>
                <th>ایمیل</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <button
                      className="action-button approve-button"
                      onClick={() => handleApprove(user._id)}
                      disabled={approvingId === user._id}
                    >
                      {approvingId === user._id ? '...' : 'تایید کاربر'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PendingUsers;