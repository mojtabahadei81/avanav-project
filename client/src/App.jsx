// src/App.jsx

import { useState, useEffect } from 'react';
import api from './api';
import AnnotationWorkspace from './components/AnnotationWorkspace';
import VerificationWorkspace from './components/VerificationWorkspace';
import ThemeSelector from './components/ThemeSelector';
import AuthPage from './components/AuthPage';
import AdminPanel from './components/AdminPanel';
import UserStats from './components/UserStats';
import ChangePasswordPage from './components/ChangePasswordPage';
import UserGuidePage from './components/UserGuidePage'; // ✅ 1. راهنمای کاربر را ایمپورت کن
import './App.css';

// نکته: دیگر نیازی به ایمپورت TAGS در این فایل نیست

function App() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('annotation');
  const [theme, setTheme] = useState("theme2");
  const [userInfo, setUserInfo] = useState(null);
  const [view, setView] = useState('dashboard');
  const [showUserGuide, setShowUserGuide] = useState(false); // ✅ 2. استیت جدید را اضافه کن

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const user = JSON.parse(storedUserInfo);
      setUserInfo(user);
      
      if (user.role === 'verifier') {
        setMode('verification');
      } else if (user.role === 'annotator') {
        setMode('annotation');
      }
    }
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUserInfo(userData);
    
    if (userData.role === 'verifier') {
      setMode('verification');
    } else if (userData.role === 'annotator') {
      setMode('annotation');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setTask(null);
    setError('');
    setMode('annotation');
  };

  const handlePasswordChanged = () => {
    const updatedUserInfo = { ...userInfo, mustChangePassword: false };
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    setUserInfo(updatedUserInfo);
  };

  const fetchNextTask = async () => {
    setLoading(true);
    setError('');
    setTask(null);
    try {
      const response = await api.get(`/api/tasks/next?mode=${mode}`);
      setTask(response.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : `دریافت تسک ${mode === 'annotation' ? 'اصلاح' : 'تایید'} ناموفق بود.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = () => { 
    fetchNextTask(); 
    refetchStats(); 
  };
  
  const handleApprove = async () => {
    if (!task) return;
    try {
      await api.post(`/api/tasks/${task._id}/verify`, { action: 'approve' });
      fetchNextTask();
      refetchStats();
    } catch (error) {
      console.error('Error approving task:', error);
      setError('تایید تسک ناموفق بود. لطفا دوباره تلاش کنید.');
      setTask(null);
    }
  };
  
  const handleReject = async () => {
    if (!task) return;
    try {
      await api.post(`/api/tasks/${task._id}/verify`, { action: 'reject' });
      fetchNextTask();
      refetchStats();
    } catch (error) {
      console.error('Error rejecting task:', error);
      setError('رد کردن تسک ناموفق بود. لطفا دوباره تلاش کنید.');
      setTask(null);
    }
  };

  const refetchStats = () => {
    window.dispatchEvent(new Event('statsUpdated'));
  };
  
  // --- رندرینگ شرطی ---
  
  if (!userInfo) {
    return (
      <div className="App">
        <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (userInfo.mustChangePassword) {
    return (
      <div className="App">
        <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
        <ChangePasswordPage onPasswordChanged={handlePasswordChanged} />
      </div>
    );
  }
  
   if (showUserGuide) {
    return (
      <div className="App">
        <UserGuidePage onClose={() => setShowUserGuide(false)} />
      </div>
    );
  }

  if (userInfo.role === 'admin' && view === 'admin') {
    return (
      <div className="App">
        <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
         <div className="top-left-controls">
          <button onClick={handleLogout} className="logout-button">خروج</button>
          <button onClick={() => setShowUserGuide(true)} className="guide-button">راهنما ؟</button>
        </div>
        <div className="App-header">
          <h1 className="dashboard-title">
            <span className="title-gradient">صدانویس</span>
            <span className="title-sub">{userInfo.firstName}، خوش آمدید!</span>
          </h1>
          
          <div className="view-selector">
            <button 
              className={view === 'dashboard' ? 'active' : ''} 
              onClick={() => setView('dashboard')}>
                داشبورد کاربر
            </button>
            <button 
              className={view === 'admin' ? 'active' : ''} 
              onClick={() => setView('admin')}>
                پنل مدیریت
            </button>
          </div>
          
          <AdminPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
      <div className="logout-button-container">
        <button onClick={handleLogout} className="logout-button">خروج</button>
      </div>
      <div className="App-header">
        <h1 className="dashboard-title">
          <span className="title-gradient">صدانویس</span>
          <span className="title-sub">{userInfo.firstName}، خوش آمدید!</span>
        </h1>
        
        {userInfo.role === 'admin' && (
          <div className="view-selector">
            <button 
              className={view === 'dashboard' ? 'active' : ''} 
              onClick={() => setView('dashboard')}>
                داشبورد کاربر
            </button>
            <button 
              className={view === 'admin' ? 'active' : ''} 
              onClick={() => setView('admin')}>
                پنل مدیریت
            </button>
          </div>
        )}
        
        <UserStats />
        
        {userInfo.role === 'admin' && (
          <div className="role-selector" data-active={mode}>
            <button 
              className={mode === 'annotation' ? 'active' : ''} 
              onClick={() => setMode('annotation')}>
               <span className="role-icon">✏️</span> اصلاح‌کننده
            </button>
            <button 
              className={mode === 'verification' ? 'active' : ''} 
              onClick={() => setMode('verification')}>
               <span className="role-icon">✓</span> تاییدکننده
            </button>
          </div>
        )}

        {userInfo.role === 'annotator' && (
          <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-color)' }}>
            <h3>🖊️ شما در حالت اصلاح‌کننده هستید</h3>
          </div>
        )}
        
        {userInfo.role === 'verifier' && (
          <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-color)' }}>
            <h3>✅ شما در حالت تاییدکننده هستید</h3>
          </div>
        )}

        <div className="main-content">
          {!task && (
            <button className="fetch-button" onClick={fetchNextTask} disabled={loading}>
              {loading ? (
                <span className="loading-spinner">🌀</span>
              ) : (
                `دریافت تسک ${mode === 'annotation' ? 'اصلاح' : 'تایید'} بعدی`
              )}
            </button>
          )}
          
          {error && <p className="error-message">{error}</p>}
          
          {/* ✅✅✅ این بخش به درستی اصلاح شد ✅✅✅ */}
          {task && mode === 'annotation' && (
            <AnnotationWorkspace 
              task={task} 
              onTaskSubmit={handleTaskSubmit}
            />
          )}

          {task && mode === 'verification' && (
            <VerificationWorkspace 
              task={task} 
              onApprove={handleApprove} 
              onReject={handleReject} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;