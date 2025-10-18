import React from 'react';
import { getTagLabel, TAGS } from '../constants/tags';
import './VerificationWorkspace.css';

const VerificationWorkspace = ({ task, onApprove, onReject }) => {
  if (!task) {
    return null;
  }

  const audioSrc = `http://localhost:5000${task.audioUrl}`;

  // === ترجمه مقادیر به برچسب‌های قابل‌فهم ===
  const genderLabel = task.gender === 'male' ? 'مرد' : task.gender === 'female' ? 'زن' : 'نامشخص';
  const ageRangeLabel = getTagLabel('AGE_RANGE', task.ageRange);
  const dialectLabel = getTagLabel('DIALECT', task.dialect);
  const emotionLabel = getTagLabel('EMOTION', task.emotion);
  const backgroundNoiseLabel = getTagLabel('BACKGROUND_NOISE', task.backgroundNoise);
  const profanityLabel = getTagLabel('PROFANITY', task.profanity);

  return (
    <div className="workspace-container verification-workspace">
      <h2>فضای کار تایید</h2>
      
      <div className="audio-player">
        <audio controls src={audioSrc}>
          مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
        </audio>
      </div>

      {/* === فقط متن اصلاح شده نمایش داده می‌شود === */}
      <div className="text-panel-single">
        <label>متن اصلاح شده</label>
        <div className="text-content corrected">{task.correctedText}</div>
      </div>

      {/* === تگ‌ها به صورت ستونی نمایش داده می‌شوند === */}
      <div className="metadata-display">
        <p><strong>اطلاعات متا:</strong></p>
        <div className="metadata-tags">
          <div className="metadata-tag">
            <span className="tag-label">جنسیت:</span>
            <span className="tag-value">{genderLabel}</span>
          </div>
          <div className="metadata-tag">
            <span className="tag-label">بازه سنی:</span>
            <span className="tag-value">{ageRangeLabel}</span>
          </div>
          <div className="metadata-tag">
            <span className="tag-label">لهجه:</span>
            <span className="tag-value">{dialectLabel}</span>
          </div>
          <div className="metadata-tag">
            <span className="tag-label">احساس:</span>
            <span className="tag-value">{emotionLabel}</span>
          </div>
          <div className="metadata-tag">
            <span className="tag-label">صدای پس‌زمینه:</span>
            <span className="tag-value">{backgroundNoiseLabel}</span>
          </div>
          <div className="metadata-tag">
            <span className="tag-label">جملات رکیک:</span>
            <span className="tag-value">{profanityLabel}</span>
          </div>
        </div>
      </div>
      
      <div className="controls verification-controls">
        <button className="reject-btn" onClick={onReject}>رد کردن</button>
        <button className="approve-btn" onClick={onApprove}>تایید</button>
      </div>
    </div>
  );
};

export default VerificationWorkspace;