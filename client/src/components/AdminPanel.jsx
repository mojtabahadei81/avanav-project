// in client/src/components/AdminPanel.jsx

import React, { useState } from 'react';
import api from '../api';
import UserManagement from './UserManagement'; // 1. ایمپورت کامپوننت جدید
import './AdminPanel.css';

// بخش آپلود را به یک کامپوننت داخلی منتقل می‌کنیم
const UploadSection = () => {
  const [audioFiles, setAudioFiles] = useState(null);
  const [metadataFile, setMetadataFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFiles || !metadataFile) {
      setError('Please select both audio files and a metadata file.');
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
      e.target.reset(); // ریست کردن کل فرم
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-section">
      <p className="admin-subtitle">Upload audio files and a metadata CSV to create new tasks.</p>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="audio-files-input">1. Select Audio Files</label>
          <input id="audio-files-input" type="file" multiple onChange={(e) => setAudioFiles(e.target.files)} accept="audio/*" required />
        </div>
        <div className="form-group">
          <label htmlFor="metadata-file-input">2. Select Metadata File (.csv)</label>
          <input id="metadata-file-input" type="file" onChange={(e) => setMetadataFile(e.target.files[0])} accept=".csv" required />
        </div>
        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload & Create Tasks'}
        </button>
      </form>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};


function AdminPanel() {
  const [activeTab, setActiveTab] = useState('upload'); // 2. State برای مدیریت تب فعال

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Admin Panel</h2>
      
      {/* 3. دکمه‌های انتخاب تب */}
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Tasks
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      {/* 4. نمایش محتوای تب فعال */}
      <div className="admin-content">
        {activeTab === 'upload' && <UploadSection />}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
  );
}

export default AdminPanel;