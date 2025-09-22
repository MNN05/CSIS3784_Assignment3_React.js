import React, { useState } from 'react';
import '../styles/App.css';

const JoinGameScreen = ({ onJoinGame }) => {
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value.toUpperCase();
    setGameCode(value);
    // Clear the error message as the user starts typing
    if (error) {
      setError('');
    }
  };

  const handleJoinClick = () => {
    // Check if the game code is exactly 4 characters long
    if (gameCode.trim().length === 4) {
      onJoinGame(gameCode);
    } else {
      setError('Game code must be exactly 4 characters.');
    }
  };

  return (
    <div className="screen-container">
      <h2>Join an Existing Game</h2>
      <input
        type="text"
        placeholder="Enter Game Code"
        value={gameCode}
        onChange={handleInputChange}
        maxLength="4" // Limits the input to 4 characters
        className="game-input"
      />
      {error && <p style={{ color: 'var(--neon-pink)', textShadow: '0 0 5px var(--neon-pink)' }}>{error}</p>}
      <button className="game-button" onClick={handleJoinClick}>
        Join
      </button>
    </div>
  );
};

export default JoinGameScreen;
