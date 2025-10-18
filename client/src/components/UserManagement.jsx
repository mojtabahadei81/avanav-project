// in src/components/UserManagement.jsx

import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import api from '../api';
import './UserManagement.css'; // استایل‌ها در همین فایل باقی می‌مانند

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // این API حالا تمام کاربران (اصلاح‌کننده و تاییدکننده) را برمی‌گرداند
      const { data } = await api.get('/api/admin/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError('بارگذاری اطلاعات کاربران ناموفق بود.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // منطق صفر کردن آمار بدون تغییر باقی می‌ماند
  const handleResetAllStats = async () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید آمار تمام کاربران را صفر کنید؟ این عمل غیرقابل بازگشت است.')) {
      try {
        await api.put(`/api/admin/users/reset`);
        alert('آمار تمام کاربران با موفقیت صفر شد!');
        fetchUsers();
      } catch (err) {
        alert('صفر کردن آمار ناموفق بود.');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="loading-spinner">🌀 در حال بارگذاری کاربران...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management-container">
      <div className="toolbar">
        <h3 className="section-title">لیست تمام کاربران</h3>
        <button className="reset-all-btn" onClick={handleResetAllStats}>
          صفر کردن آمار همه کاربران
        </button>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>نام خانوادگی</th>
              <th>شماره تلفن</th>
              <th>نقش</th>
              <th>وضعیت</th>
              <th>اصلاح‌ها</th>
              <th>تاییدها</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.role === 'annotator' ? 'اصلاح‌کننده' : 'تاییدکننده'}</td>
                  <td>
                    {/* نمایش وضعیت با یک نشان رنگی */}
                    <span className={`status-badge status-${user.status}`}>
                      {user.status === 'active' ? 'فعال' : 'در انتظار'}
                    </span>
                  </td>
                  <td>{user.annotationsCompleted}</td>
                  <td>{user.verificationsCompleted}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">هیچ کاربری یافت نشد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

UserManagement.displayName = 'UserManagement';

export default UserManagement;