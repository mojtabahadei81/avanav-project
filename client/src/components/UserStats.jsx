// in client/src/components/UserStats.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import './UserStats.css';

function UserStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/users/stats');
        setStats(data);
        setError('');
      } catch (err) {
        setError('Could not load stats.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="stats-container stats-loading">Loading stats...</div>;
  }

  if (error) {
    return <div className="stats-container stats-error">{error}</div>;
  }

  return (
    <div className="stats-container">
      <h3 className="stats-title">Your Performance</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-value">{stats ? stats.annotationsCompleted : 0}</p>
          <p className="stat-label">Annotations Completed</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{stats ? stats.verificationsCompleted : 0}</p>
          <p className="stat-label">Verifications Completed</p>
        </div>
        {/* کارت درآمد تخمینی به طور کامل حذف شد */}
      </div>
    </div>
  );
}

export default UserStats;