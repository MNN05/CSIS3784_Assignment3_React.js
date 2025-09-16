import React from 'react';
import '../styles/App.css';

const PlayerWaitingLobby = ({ gameInfo, players, onStartGame }) => {
  const isHost = true; // Assuming the creator is the host for now

  return (
    <div className="lobby-container">
      <h2>Game Lobby</h2>
      <p>Game Code: <span style={{ color: 'var(--neon-pink)' }}>{gameInfo.code}</span></p>
      
      <div className="players-list-lobby">
        <h3>Players:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index} style={{ color: player.color }}>
              {player.username}
            </li>
          ))}
        </ul>
      </div>
      
      {isHost ? (
        <button className="start-game-button" onClick={onStartGame}>
          Start Game
        </button>
      ) : (
        <p className="waiting-message">Waiting for the host to start the game...</p>
      )}
    </div>
  );
};

export default PlayerWaitingLobby;