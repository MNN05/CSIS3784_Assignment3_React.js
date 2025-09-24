import React, { useEffect } from 'react';
import '../styles/App.css';

const CreateGameScreen = ({ gameCode, onNext, ws, gameInfo }) => {
  useEffect(() => {
    // Only join lobby if username & color exist (host auto-joined)
    if (ws?.current && gameInfo?.username && gameInfo?.color) {
      ws.current.send(JSON.stringify({
        type: 'join-lobby',
        gameCode: gameCode,
        player: {
          username: gameInfo.username,
          color: gameInfo.color,
          points: 0
        }
      }));
    }
  }, [ws, gameInfo, gameCode]);

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

