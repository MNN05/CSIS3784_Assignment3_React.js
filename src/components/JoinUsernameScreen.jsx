import React, { useState } from 'react';
import '../styles/App.css';

const JoinUsernameScreen = ({ onFinalJoin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setUsername(event.target.value);
    // Clear the error message as the user starts typing
    if (error) {
      setError('');
    }
  };

  const handleJoinClick = () => {
    if (username.trim().length >= 3) {
      onFinalJoin(username);
    } else {
      setError('Username must be at least 3 characters long.');
    }
  };

  return (
    <div className="screen-container">
      <h2>Enter Your Username</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={handleInputChange}
        className="game-input"
      />
      {error && <p style={{ color: 'var(--neon-pink)', textShadow: '0 0 5px var(--neon-pink)' }}>{error}</p>}
      <button className="game-button" onClick={handleJoinClick}>
        Join Game
      </button>
    </div>
  );
};

export default JoinUsernameScreen;