import React from 'react';
import '../styles/App.css'; 

const WelcomeScreen = ({ onStartClick }) => {
  return (
    <div className="welcome-container">
      <h1>Welcome to Laser Tag Treasure Hunt!</h1>
      <p>Are you ready to play?</p>
      <button className="start-button" onClick={onStartClick}>
        Start
      </button>
    </div>
  );
};

export default WelcomeScreen;