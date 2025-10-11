// in client/src/App.jsx
import { useState, useEffect } from 'react';
import api from './api'; // <-- 1. تغییر: استفاده از api به جای axios
import AnnotationWorkspace from './components/AnnotationWorkspace';
import VerificationWorkspace from './components/VerificationWorkspace';
import ThemeSelector from './components/ThemeSelector';
import AuthPage from './components/AuthPage';
import AdminPanel from './components/AdminPanel';
import UserStats from './components/UserStats';
import './App.css';
import './components/AuthPage.css';

// ... (آرایه‌های GENDER_OPTIONS و AGE_RANGE_OPTIONS بدون تغییر)
const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
const AGE_RANGE_OPTIONS = [
  { value: '', label: 'Select Age Range' },
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
  { value: '46+', label: '46+' },
];


function App() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('annotation');
  const [theme, setTheme] = useState("theme2");
  const [userInfo, setUserInfo] = useState(null);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  
  // 2. این useEffect دیگر لازم نیست و حذف می‌شود
  // چون api.js این کار را به صورت خودکار برای هر درخواست انجام می‌دهد

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUserInfo(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setTask(null);
    setError('');
  };

  const fetchNextTask = async () => {
    setLoading(true);
    setError('');
    setTask(null);
    try {
      // 3. تغییر: استفاده از api.get و URL کوتاه شده
      const response = await api.get(`/api/tasks/next?mode=${mode}`);
      setTask(response.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : `Failed to fetch ${mode} task.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = () => {
    fetchNextTask();
  };

  const handleApprove = async () => {
    if (!task) return;
    try {
      // 4. تغییر: استفاده از api.post و URL کوتاه شده
      await api.post(`/api/tasks/${task._id}/verify`, { action: 'approve' });
      fetchNextTask();
    } catch (error) {
      console.error('Error approving task:', error);
      setError('Failed to approve the task. Please try again.');
      setTask(null);
    }
  };

  const handleReject = async () => {
    if (!task) return;
    try {
      // 5. تغییر: استفاده از api.post و URL کوتاه شده
      await api.post(`/api/tasks/${task._id}/verify`, { action: 'reject' });
      fetchNextTask();
    } catch (error) {
      console.error('Error rejecting task:', error);
      setError('Failed to reject the task. Please try again.');
      setTask(null);
    }
  };
  
  // ... (کد JSX شما بدون تغییر باقی می‌ماند)
  if (!userInfo) {
    return (
      <div className="App">
        <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }
  return (
    <div className="App">
      <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
      <div className="logout-button-container">
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="App-header">
        <h1 className="dashboard-title">
          <span className="title-gradient">Avanav</span>
          <span className="title-sub">Welcome, {userInfo.name}!</span>
        </h1>
        
        {userInfo.isAdmin && (
          <div className="view-selector">
            <button 
              className={view === 'dashboard' ? 'active' : ''} 
              onClick={() => setView('dashboard')}>
                User Dashboard
            </button>
            <button 
              className={view === 'admin' ? 'active' : ''} 
              onClick={() => setView('admin')}>
                Admin Panel
            </button>
          </div>
        )}
        
        {view === 'admin' && userInfo.isAdmin ? (
          <AdminPanel />
        ) : (
          <>
            <UserStats /> 
            
            <div className="role-selector" data-active={mode}>
              <button className={mode === 'annotation' ? 'active' : ''} onClick={() => setMode('annotation')}>
                 <span className="role-icon">✏️</span> Annotator
              </button>
              <button className={mode === 'verification' ? 'active' : ''} onClick={() => setMode('verification')}>
                 <span className="role-icon">✓</span> Verifier
              </button>
            </div>

            <div className="main-content">
              {!task && (
                <button className="fetch-button" onClick={fetchNextTask} disabled={loading}>
                  {loading ? (<span className="loading-spinner">🌀</span>) : `Get Next ${mode === 'annotation' ? 'Annotation' : 'Verification'} Task`}
                </button>
              )}
              {error && <p className="error-message">{error}</p>}
              
              {task && mode === 'annotation' && (
                <AnnotationWorkspace 
                  task={task} 
                  onTaskSubmit={handleTaskSubmit}
                  genderOptions={GENDER_OPTIONS}
                  ageRangeOptions={AGE_RANGE_OPTIONS}
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;