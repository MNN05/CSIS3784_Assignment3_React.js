import React from 'react';
import '../styles/App.css';

const RoleSelectionScreen = ({ onSelectRole }) => {
  return (
    <div className="screen-container">
      <h2>How do you want to play?</h2>
      <div className="button-group">
        <button className="role-button" onClick={() => onSelectRole('player')}>
          JOIN AS PLAYER
        </button>
        <button className="role-button" onClick={() => onSelectRole('spectator')}>
          JOIN AS SPECTATOR
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;