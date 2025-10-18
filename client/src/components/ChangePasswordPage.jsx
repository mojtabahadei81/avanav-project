// in src/components/ChangePasswordPage.jsx

import React, { useState } from 'react';
import api from '../api';
import './AuthPage.css'; // می‌توانیم از استایل‌های مشابه صفحه لاگین استفاده کنیم

const ChangePasswordPage = ({ onPasswordChanged }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('رمز عبور جدید با تکرار آن مطابقت ندارد.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.put('/api/users/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccess(data.message + ' در حال انتقال به داشبورد...');
      // بعد از 2 ثانیه، تابع onPasswordChanged را اجرا می‌کنیم تا App.jsx کاربر را به داشبورد ببرد
      setTimeout(() => {
        onPasswordChanged();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطایی در تغییر رمز عبور رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">تغییر رمز عبور</h2>
        <p className="auth-subtitle">برای امنیت بیشتر، لطفا در اولین ورود رمز عبور خود را تغییر دهید.</p>
        
        {success ? (
          <div className="auth-success">{success}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="currentPassword">رمز عبور فعلی (شماره تلفن شما)</label>
              <input 
                type="password" 
                id="currentPassword" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="newPassword">رمز عبور جدید</label>
              <input 
                type="password" 
                id="newPassword" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">تکرار رمز عبور جدید</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            {error && <p className="auth-error">{error}</p>}
            
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'در حال پردازش...' : 'ثبت رمز عبور جدید'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;