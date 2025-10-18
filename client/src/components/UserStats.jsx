import React, { useState, useEffect } from 'react';
import api from '../api';
import './UserStats.css';

function UserStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // تابع برای دریافت آمار
  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/users/stats');
      setStats(data);
      setError('');
    } catch (err) {
      setError('بارگذاری آمار ناموفق بود.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // بارگذاری اولیه
  useEffect(() => {
    fetchStats();
  }, []);

  // === Listener برای آپدیت Real-time === 
  useEffect(() => {
    const handleStatsUpdated = () => {
      fetchStats();
    };

    window.addEventListener('statsUpdated', handleStatsUpdated);
    
    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdated);
    };
  }, []);

  if (loading) {
    return <div className="stats-container stats-loading">در حال بارگذاری آمار...</div>;
  }

  if (error) {
    return <div className="stats-container stats-error">{error}</div>;
  }

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="stats-container">
      <h3 className="stats-title">عملکرد شما</h3>
      <div className="stats-grid">
        {(stats.userRole === 'annotator' || stats.userRole === 'admin') && (
          <div className="stat-card">
            <p className="stat-value">{stats.annotationsCompleted}</p>
            <p className="stat-label">اصلاح‌های انجام شده</p>
          </div>
        )}

        {(stats.userRole === 'verifier' || stats.userRole === 'admin') && (
          <div className="stat-card">
            <p className="stat-value">{stats.verificationsCompleted}</p>
            <p className="stat-label">تاییدهای انجام شده</p>
          </div>
        )}

        <div className="stat-card earning-card">
          <p className="stat-value">{stats ? formatNumber(stats.estimatedEarnings) : 0}</p>
          <p className="stat-label">درآمد تخمینی (تومان)</p>
        </div>
      </div>
    </div>
  );
}

export default UserStats;