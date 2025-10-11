// in client/src/components/AuthPage.jsx
import React, { useState } from 'react';
import api from '../api'; // <-- 1. تغییر: استفاده از api
import './AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 2. تغییر: URL های کوتاه شده
    const url = isLoginMode ? '/api/users/login' : '/api/users/register';
    const payload = isLoginMode ? { email, password } : { name, email, password };

    try {
      // 3. تغییر: استفاده از api.post
      const { data } = await api.post(url, payload);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (کد JSX شما بدون تغییر باقی می‌ماند)
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">{isLoginMode ? 'Welcome Back!' : 'Create Account'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className="auth-error">{error}</p>}
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="auth-toggle">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;