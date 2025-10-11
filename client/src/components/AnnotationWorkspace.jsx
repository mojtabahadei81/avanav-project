import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure axios is imported

const AnnotationWorkspace = ({ task, onTaskSubmit }) => { // 1. onTaskSubmit prop added
  const [correctedText, setCorrectedText] = useState('');
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');

  useEffect(() => {
    if (task) {
      setCorrectedText(task.originalText);
      setGender('');
      setAgeRange('');
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSubmit = async () => { // 2. Make the function async
    // Simple validation
    if (!correctedText || !gender || !ageRange) {
      alert('Please fill all fields before submitting.');
      return;
    }

    try {
      // 3. Send PUT request to the server
      const response = await axios.put(`http://localhost:5000/api/tasks/${task._id}`, {
        correctedText,
        gender,
        ageRange,
      });

      console.log('Task updated successfully:', response.data);
      onTaskSubmit(); // 4. Notify the parent component that the task is done
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to submit correction. Please try again.');
    }
  };

  const audioSrc = `http://localhost:5000${task.audioUrl}`;

  return (
    <div className="workspace-container">
      <h2>Annotation Workspace</h2>
      <p><strong>Task ID:</strong> {task._id}</p>
      
      <div className="audio-player">
        <audio controls src={audioSrc}>
          Your browser does not support the audio element.
        </audio>
      </div>

      <div className="text-editor">
        <label htmlFor="transcription">Transcription:</label>
        <textarea
          id="transcription"
          value={correctedText}
          onChange={(e) => setCorrectedText(e.target.value)}
          rows="5"
        />
      </div>

      <div className="metadata-form">
        <div>
          <label htmlFor="gender">Gender:</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            {/* options... */}
          </select>
        </div>
        <div>
          <label htmlFor="age">Age Range:</label>
          <select id="age" value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
            {/* options... */}
          </select>
        </div>
      </div>
      
      <div className="controls">
        <button onClick={handleSubmit}>Submit Correction</button>
      </div>
    </div>
  );
};

export default AnnotationWorkspace;