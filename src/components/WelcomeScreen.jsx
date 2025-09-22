import React from 'react';
import '../styles/App.css'; // You can add your styling here

const WelcomeScreen = ({ onStartClick }) => {
  return (
    <div className="welcome-container">
      <h1>Welcome to Laser Tag!</h1>
      <p>Are you ready to play?</p>
      <button className="start-button" onClick={onStartClick}>
        Start
      </button>
    </div>
  );
};

export default WelcomeScreen;