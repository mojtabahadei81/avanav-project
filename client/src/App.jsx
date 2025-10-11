import React, { useState } from 'react';
import axios from 'axios';
import AnnotationWorkspace from './components/AnnotationWorkspace';
// در مراحل بعد کامپوننت VerificationWorkspace را خواهیم ساخت
// import VerificationWorkspace from './components/VerificationWorkspace'; 
import './App.css';

function App() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('annotation'); // 'annotation' or 'verification'

  const fetchNextTask = async () => {
    setLoading(true);
    setError('');
    setTask(null);
    try {
      // TODO: در قدم بعدی، این آدرس را بر اساس mode تغییر خواهیم داد
      const response = await axios.get('http://localhost:5000/api/tasks/next');
      setTask(response.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Failed to fetch task.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = () => {
    fetchNextTask();
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1>Avanav Dashboard</h1>
        
        {/* --- Role Selector --- */}
        <div className="role-selector">
          <button 
            className={mode === 'annotation' ? 'active' : ''}
            onClick={() => setMode('annotation')}
          >
            Annotator
          </button>
          <button 
            className={mode === 'verification' ? 'active' : ''}
            onClick={() => setMode('verification')}
          >
            Verifier
          </button>
        </div>

        {/* --- Main Content --- */}
        <div className="main-content">
          {!task && (
            <button onClick={fetchNextTask} disabled={loading}>
              {loading ? 'Loading...' : `Get Next ${mode === 'annotation' ? 'Annotation' : 'Verification'} Task`}
            </button>
          )}
          {error && <p className="error-message">Error: {error}</p>}
          
          {task && <AnnotationWorkspace task={task} onTaskSubmit={handleTaskSubmit} />}
          {/* TODO: در مراحل بعد، بر اساس نوع تسک، کامپوننت مناسب را نمایش خواهیم داد */}
        </div>

      </div>
    </div>
  );
}

export default App;