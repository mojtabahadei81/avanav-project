import { useState, useEffect } from 'react';
import axios from 'axios';
import AnnotationWorkspace from './components/AnnotationWorkspace';
import VerificationWorkspace from './components/VerificationWorkspace';
import ThemeSelector from './components/ThemeSelector';
import AuthPage from './components/AuthPage';
import './App.css';
import './components/AuthPage.css';

// گزینه‌های ثابت برای جنسیت و سن
const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const AGE_RANGE_OPTIONS = [
  { value: '', label: 'Select Age Range' },
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
  { value: '46+', label: '46+' }
];

function App() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('annotation');
  const [theme, setTheme] = useState("theme2");
  
  const [userInfo, setUserInfo] = useState(null);

  // useEffect اول: برای بارگذاری اطلاعات کاربر از localStorage و تنظیم تم اولیه
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  
  // useEffect دوم: برای مدیریت هدر Authorization در axios بر اساس وضعیت ورود کاربر
  useEffect(() => {
    if (userInfo) {
      // اگر کاربر وارد شده باشد، هدر پیش‌فرض را برای تمام درخواست‌های axios تنظیم کن
      axios.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
    } else {
      // اگر کاربر خارج شده باشد، هدر پیش‌فرض را حذف کن
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [userInfo]); // این افکت فقط زمانی اجرا می‌شود که userInfo تغییر کند

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
      const response = await axios.get(`http://localhost:5000/api/tasks/next?mode=${mode}`);
      setTask(response.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : `Failed to fetch ${mode} task.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = () => {
    // Note: The actual submission is handled inside AnnotationWorkspace
    // This function is just to trigger fetching the next task after a successful submission.
    fetchNextTask();
  };

  const handleApprove = async () => {
    if (!task) return;
    try {
      await axios.post(`http://localhost:5000/api/tasks/${task._id}/verify`, { action: 'approve' });
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
      await axios.post(`http://localhost:5000/api/tasks/${task._id}/verify`, { action: 'reject' });
      fetchNextTask();
    } catch (error) {
      console.error('Error rejecting task:', error);
      setError('Failed to reject the task. Please try again.');
      setTask(null);
    }
  };
  
  // اگر کاربری وارد نشده باشد، صفحه ورود/ثبت‌نام را نمایش بده
  if (!userInfo) {
    return (
      <div className="App">
        <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // اگر کاربر وارد شده باشد، داشبورد اصلی را نمایش بده
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
      </div>
    </div>
  );
}

export default App;