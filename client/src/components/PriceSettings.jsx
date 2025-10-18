// in src/components/PriceSettings.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import './UserManagement.css'; // از استایل‌های موجود استفاده می‌کنیم

function PriceSettings() {
  const [annotationPrice, setAnnotationPrice] = useState(700);
  const [verificationPrice, setVerificationPrice] = useState(700);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/api/admin/settings');
      setAnnotationPrice(data.annotationPrice);
      setVerificationPrice(data.verificationPrice);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('بارگذاری تنظیمات ناموفق بود.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.put('/api/admin/settings', {
        annotationPrice: Number(annotationPrice),
        verificationPrice: Number(verificationPrice),
      });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'به‌روزرسانی قیمت‌ها ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-management-container">
      <h3 className="section-title">تنظیمات قیمت‌گذاری</h3>
      <p style={{ textAlign: 'center', color: 'var(--text-color-secondary)', marginBottom: '2rem' }}>
        قیمت‌های زیر برای محاسبه درآمد تخمینی کاربران استفاده می‌شود.
      </p>

      <div className="auth-form-wrapper" style={{ maxWidth: '500px', margin: 'auto', padding: '30px' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="annotationPrice">قیمت هر اصلاح (تومان)</label>
            <input
              type="number"
              id="annotationPrice"
              value={annotationPrice}
              onChange={(e) => setAnnotationPrice(e.target.value)}
              min="0"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="verificationPrice">قیمت هر تایید (تومان)</label>
            <input
              type="number"
              id="verificationPrice"
              value={verificationPrice}
              onChange={(e) => setVerificationPrice(e.target.value)}
              min="0"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success" style={{ marginBottom: '15px' }}>{success}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PriceSettings;