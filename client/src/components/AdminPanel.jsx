// in src/components/AdminPanel.jsx

import React, { useState, useRef } from 'react';
import api from '../api';
import UserManagement from './UserManagement';
import PendingUsers from './PendingUsers';
import CreateVerifier from './CreateVerifier';
import './AdminPanel.css';
import PriceSettings from './PriceSettings'; // ← این خط را اضافه کنید
import AdminGuidePage from './AdminGuidePage'; // ✅ 1. راهنمای ادمین را ایمپورت کن


// بخش بارگذاری تسک‌ها - همان کد قبلی با بهبودهای جزئی
const UploadSection = () => {
  const [audioFiles, setAudioFiles] = useState(null);
  const [metadataFile, setMetadataFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFiles || !metadataFile) {
      setError('لطفاً هم فایل‌های صوتی و هم فایل متادیتا را انتخاب کنید.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('metadata', metadataFile);
    for (let i = 0; i < audioFiles.length; i++) {
      formData.append('audioFiles', audioFiles[i]);
    }
    try {
      const response = await api.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message);
      e.target.reset();
      setAudioFiles(null);
      setMetadataFile(null);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'بارگذاری ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-section">
      <p className="admin-subtitle">برای ایجاد تسک‌های جدید، فایل‌های صوتی و یک فایل متادیتا را بارگذاری کنید.</p>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="audio-files-input">۱. فایل‌های صوتی را انتخاب کنید</label>
          <input 
            id="audio-files-input" 
            type="file" 
            multiple 
            onChange={(e) => setAudioFiles(e.target.files)} 
            accept="audio/*" 
            required 
          />
          {audioFiles && <span className="file-count">{audioFiles.length} فایل انتخاب شده</span>}
        </div>
        <div className="form-group">
          <label htmlFor="metadata-file-input">۲. فایل متادیتا (.csv یا .json) را انتخاب کنید</label>
          <input 
            id="metadata-file-input" 
            type="file" 
            onChange={(e) => setMetadataFile(e.target.files[0])} 
            accept=".csv,.json" 
            required 
          />
        </div>
        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? (
            <>
              <span className="loading-spinner-btn">🌀</span>
              در حال بارگذاری...
            </>
          ) : (
            'بارگذاری و ایجاد تسک‌ها'
          )}
        </button>
      </form>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('upload');
  const userManagementRef = useRef();

  const handleRefreshUsers = () => {
    if (userManagementRef.current && userManagementRef.current.fetchUsers) {
      userManagementRef.current.fetchUsers();
    }
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-title">پنل مدیریت</h2>
      
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 بارگذاری تسک‌ها
        </button>
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ تایید کاربران
        </button>
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ ایجاد تاییدکننده
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 مدیریت کاربران
        </button>
        <button
          className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          💰 تنظیمات قیمت
        </button>
        <button
          className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          ❓ راهنما
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'upload' && <UploadSection />}
        {activeTab === 'pending' && <PendingUsers onUserApproved={handleRefreshUsers} />}
        {activeTab === 'create' && <CreateVerifier onVerifierCreated={handleRefreshUsers} />}
        {activeTab === 'users' && <UserManagement ref={userManagementRef} />}
        {activeTab === 'pricing' && <PriceSettings />}
        {activeTab === 'guide' && <AdminGuidePage />}
      </div>
    </div>
  );
}

export default AdminPanel;