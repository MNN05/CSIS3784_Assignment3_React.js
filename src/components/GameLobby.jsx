import React from 'react';
import '../styles/App.css';

const GameLobby = ({ onCreateGame, onJoinGame }) => {
  return (
    <div className="game-lobby-container">
      <h2>Select an Option</h2>
      <div className="button-group">
        <button className="lobby-button" onClick={onCreateGame}>
          CREATE GAME
        </button>
        <button className="lobby-button" onClick={onJoinGame}>
          JOIN GAME
        </button>
      </div>
    </div>
  );
};

export default GameLobby;