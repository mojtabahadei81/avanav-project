import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnnotationWorkspace = ({ task, onTaskSubmit }) => {
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

  const handleSubmit = async () => {
    if (!correctedText || !gender || !ageRange) {
      alert('Please fill all fields before submitting.');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/tasks/${task._id}`, {
        correctedText,
        gender,
        ageRange,
      });

      console.log('Task updated successfully:', response.data);
      onTaskSubmit();
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
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>

        </div>
        <div>
          <label htmlFor="age">Age Range:</label>
            <select id="age" value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
                <option value="">Select Age Range</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46+">46+</option>
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