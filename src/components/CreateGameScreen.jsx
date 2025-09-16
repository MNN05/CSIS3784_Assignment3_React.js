import React from 'react';
import '../styles/App.css';

const CreateGameScreen = ({ gameCode, onNext }) => {
  return (
    <div className="screen-container">
      <h2>Your Game Code</h2>
      <p>Share this code with your teammates.</p>
      <div className="game-code-display">
        <h3>{gameCode}</h3>
      </div>
      <button className="start-button" onClick={onNext}>
        Next
      </button>
    </div>
  );
};

export default CreateGameScreen;