import React from 'react';

const VerificationWorkspace = ({ task, onApprove, onReject }) => {
  if (!task) {
    return null;
  }

  const audioSrc = `http://localhost:5000${task.audioUrl}`;

  return (
    <div className="workspace-container verification-workspace">
      <h2>Verification Workspace</h2>
      <p><strong>Task ID:</strong> {task._id}</p>
      
      <div className="audio-player">
        <audio controls src={audioSrc}>
          Your browser does not support the audio element.
        </audio>
      </div>

      <div className="text-comparison">
        <div className="text-panel">
          <label>Original Text</label>
          <div className="text-content">{task.originalText}</div>
        </div>
        <div className="text-panel">
          <label>Corrected Text</label>
          <div className="text-content corrected">{task.correctedText}</div>
        </div>
      </div>

      <div className="metadata-display">
        <p><strong>Annotator's Tags:</strong></p>
        <span>Gender: <strong>{task.gender}</strong></span>
        <span>Age Range: <strong>{task.ageRange}</strong></span>
      </div>
      
      <div className="controls verification-controls">
        <button className="reject-btn" onClick={onReject}>Reject</button>
        <button className="approve-btn" onClick={onApprove}>Approve</button>
      </div>
    </div>
  );
};

export default VerificationWorkspace;