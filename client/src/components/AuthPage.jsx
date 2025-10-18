// in src/components/AuthPage.jsx

import React, { useState } from 'react';
import api from '../api';
import './AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
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
    if (!email) return true; // ایمیل اختیاری است
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // اعتبارسنجی شماره تلفن
    if (!validatePhoneNumber(phoneNumber)) {
      setError('شماره تلفن باید با 09 شروع شود و دقیقاً 11 رقم باشد.');
      return;
    }

    // اعتبارسنجی ایمیل (فقط در حالت ثبت‌نام و اگر وارد شده باشد)
    if (!isLoginMode && email && !validateEmail(email)) {
      setError('فرمت ایمیل صحیح نیست.');
      return;
    }

    setLoading(true);

    if (isLoginMode) {
      // --- منطق ورود ---
      try {
        const { data } = await api.post('/api/users/login', { phoneNumber, password });
        onLoginSuccess(data);
      } catch (err) {
        setError(err.response?.data?.message || 'خطایی در ورود رخ داد.');
      }
    } else {
      // --- منطق ثبت‌نام ---
      try {
        const { data } = await api.post('/api/users/register', { 
          firstName, 
          lastName, 
          phoneNumber, 
          email: email || undefined // اگر خالی باشد، undefined ارسال می‌کنیم
        });
        setSuccessMessage(data.message);
        // پاک کردن فرم
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setEmail('');
      } catch (err) {
        setError(err.response?.data?.message || 'خطایی در ثبت‌نام رخ داد.');
      }
    }
    setLoading(false);
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccessMessage('');
  };

  // تابع کمکی برای محدود کردن ورودی به اعداد فارسی/انگلیسی
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // تبدیل اعداد فارسی به انگلیسی
    value = value.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    // فقط اعداد را نگه دار
    value = value.replace(/\D/g, '');
    // محدود به 11 رقم
    if (value.length <= 11) {
      setPhoneNumber(value);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">{isLoginMode ? 'خوش آمدید!' : 'ایجاد حساب کاربری'}</h2>
        
        {successMessage ? (
          <div className="auth-success">
            <p>{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <>
                <div className="input-group">
                  <label htmlFor="firstName">نام</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="lastName">نام خانوادگی</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required 
                  />
                </div>
              </>
            )}
            
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

            {!isLoginMode && (
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
            )}

            {isLoginMode && (
              <div className="input-group">
                <label htmlFor="password">رمز عبور</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}
            
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'در حال پردازش...' : (isLoginMode ? 'ورود' : 'ثبت نام')}
            </button>
          </form>
        )}

        <p className="auth-toggle">
          {isLoginMode ? "حساب کاربری ندارید؟" : "قبلاً ثبت‌نام کرده‌اید؟"}
          <button onClick={handleToggleMode}>
            {isLoginMode ? 'ثبت نام کنید' : 'وارد شوید'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;