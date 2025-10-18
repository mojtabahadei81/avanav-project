// src/components/AnnotationWorkspace.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import { TAGS } from '../constants/tags'; // <-- مطمئن شوید این import درست است
import './AnnotationWorkspace.css';

const AnnotationWorkspace = ({ task, onTaskSubmit }) => {
  // === State ها برای همه فیلدها ===
  const [correctedText, setCorrectedText] = useState('');
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [dialect, setDialect] = useState('');
  const [emotion, setEmotion] = useState('');
  const [backgroundNoise, setBackgroundNoise] = useState('');
  const [profanity, setProfanity] = useState('');

  // === ریست کردن فرم با تسک جدید ===
  useEffect(() => {
    if (task) {
      setCorrectedText(task.originalText);
      setGender('');
      setAgeRange('');
      setDialect('');
      setEmotion('');
      setBackgroundNoise('');
      setProfanity('');
    }
  }, [task]);

  if (!task) {
    return null;
  }

  // === ارسال داده‌ها به سرور ===
  const handleSubmit = async () => {
    if (!correctedText || !gender || !ageRange || !dialect || !emotion || !backgroundNoise || !profanity) {
      alert('لطفا قبل از ثبت، تمام فیلدها را پر کنید.');
      return;
    }
    try {
      // ✅ ارسال تمام فیلدها به API
      await api.put(`/api/tasks/${task._id}`, {
        correctedText,
        gender,
        ageRange,
        dialect,
        emotion,
        backgroundNoise,
        profanity,
      });
      onTaskSubmit();
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('ثبت اصلاح ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  };

  const audioSrc = `http://localhost:5000${task.audioUrl}`;

  return (
    <div className="workspace-container">
      <h2>فضای کار اصلاح</h2>
      
      <div className="audio-player">
        <audio controls src={audioSrc}>
          مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
        </audio>
      </div>

      <div className="text-editor">
        <label htmlFor="transcription">متن پیاده‌سازی شده:</label>
        <textarea
          id="transcription"
          value={correctedText}
          onChange={(e) => setCorrectedText(e.target.value)}
          rows="5"
        />
      </div>

      {/* === ✅ بخش نمایش تمام تگ‌ها === */}

      {/* --- سطر اول: جنسیت و بازه سنی --- */}
      <div className="metadata-form">
        <div>
          <label htmlFor="gender">{TAGS.GENDER.label}:</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            {TAGS.GENDER.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="age">{TAGS.AGE_RANGE.label}:</label>
          <select id="age" value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
            {TAGS.AGE_RANGE.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- سطر دوم: لهجه و احساسات --- */}
      <div className="metadata-form">
        <div>
          <label htmlFor="dialect">{TAGS.DIALECT.label}:</label>
          <select id="dialect" value={dialect} onChange={(e) => setDialect(e.target.value)}>
            {TAGS.DIALECT.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="emotion">{TAGS.EMOTION.label}:</label>
          <select id="emotion" value={emotion} onChange={(e) => setEmotion(e.target.value)}>
            {TAGS.EMOTION.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- سطر سوم: صدای پس‌زمینه و جملات رکیک --- */}
      <div className="metadata-form">
        <div>
          <label htmlFor="backgroundNoise">{TAGS.BACKGROUND_NOISE.label}:</label>
          <select id="backgroundNoise" value={backgroundNoise} onChange={(e) => setBackgroundNoise(e.target.value)}>
            {TAGS.BACKGROUND_NOISE.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="profanity">{TAGS.PROFANITY.label}:</label>
          <select id="profanity" value={profanity} onChange={(e) => setProfanity(e.target.value)}>
            {TAGS.PROFANITY.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="controls">
        <button onClick={handleSubmit}>ثبت اصلاح</button>
      </div>
    </div>
  );
};

export default AnnotationWorkspace;