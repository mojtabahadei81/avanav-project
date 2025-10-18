// in src/components/CreateVerifier.jsx

import React, { useState } from 'react';
import api from '../api';
import './AuthPage.css';
import './UserManagement.css';

const CreateVerifier = ({ onVerifierCreated }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // توابع اعتبارسنجی
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // اعتبارسنجی
    if (!validatePhoneNumber(phoneNumber)) {
      setError('شماره تلفن باید با 09 شروع شود و دقیقاً 11 رقم باشد.');
      return;
    }

    if (email && !validateEmail(email)) {
      setError('فرمت ایمیل صحیح نیست.');
      return;
    }

    if (password.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/api/admin/create-verifier', {
        firstName,
        lastName,
        phoneNumber,
        email: email || undefined,
        password,
      });
      setSuccessMessage(data.message);
      // پاک کردن فرم
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      onVerifierCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'ایجاد کاربر ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhoneNumber(value);
    }
  };

  return (
    <div className="user-management-container">
      <h3 className="section-title">ایجاد کاربر تاییدکننده جدید</h3>
      <p className="auth-subtitle" style={{ textAlign: 'center', marginTop: '10px' }}>
        کاربر ایجاد شده بلافاصله فعال شده و می‌تواند وارد سیستم شود.
      </p>

      <div className="auth-form-wrapper" style={{ maxWidth: '500px', margin: 'auto', padding: '30px' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="firstName">نام</label>
            <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="lastName">نام خانوادگی</label>
            <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="phoneNumber">شماره تلفن (نام کاربری)</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              value={phoneNumber} 
              onChange={handlePhoneChange}
              placeholder="09123456789"
              required 
            />
            <small className="input-hint">شماره باید با 09 شروع شود و 11 رقم باشد</small>
          </div>
          <div className="input-group">
            <label htmlFor="email">ایمیل (اختیاری)</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">رمز عبور</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <small className="input-hint">حداقل 6 کاراکتر</small>
          </div>

          {error && <p className="auth-error">{error}</p>}
          {successMessage && <p className="auth-success" style={{ marginBottom: '15px' }}>{successMessage}</p>}
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'در حال ایجاد...' : 'ایجاد کاربر'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateVerifier;