import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import './App.css'; // You can keep the default styles for now

function App() {
  // State to store the task data
  const [task, setTask] = useState(null);
  // State to handle loading status
  const [loading, setLoading] = useState(false);
  // State to handle any errors
  const [error, setError] = useState('');

  const fetchNextTask = async () => {
    setLoading(true);
    setError('');
    setTask(null);
    try {
      // Send a GET request to our backend API
      const response = await axios.get('http://localhost:5000/api/tasks/next');
      setTask(response.data); // Store the received task in the state
    } catch (err) {
      // Handle errors (e.g., no tasks available, or server is down)
      setError(err.response ? err.response.data.message : 'Failed to fetch task.');
    } finally {
      setLoading(false); // Stop loading, regardless of outcome
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Avanav Annotation Dashboard</h1>
        <button onClick={fetchNextTask} disabled={loading}>
          {loading ? 'Loading...' : 'Get Next Task'}
        </button>

        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        {task && (
          <div className="task-container" style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
            <h2>Task Details</h2>
            <p><strong>Task ID:</strong> {task._id}</p>
            <p><strong>Audio URL:</strong> {task.audioUrl}</p>
            <p><strong>Original Text:</strong> {task.originalText}</p>
            <p><strong>Status:</strong> {task.status}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;