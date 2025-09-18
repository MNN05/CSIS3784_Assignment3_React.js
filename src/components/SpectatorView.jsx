import React, { useState, useEffect } from 'react';
import '../styles/App.css';

const SpectatorView = ({ gameInfo }) => {
  const [timer, setTimer] = useState(5 * 60); // 5 minutes in seconds

  useEffect(() => {
    // This hook will handle the timer countdown
    const countdown = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(countdown);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Placeholder player data - this would come from your backend via a WebSocket
  const players = [
    { username: 'Player1', points: 150, videoFeed: 'https://example.com/stream1' },
    { username: 'Player2', points: 220, videoFeed: 'https://example.com/stream2' },
    { username: 'Player3', points: 80, videoFeed: 'https://example.com/stream3' }
  ];

  return (
    <div className="spectator-container">
      <h1>Spectator View</h1>
      <div className="game-stats">
        <div className="stat-box">
          <h3>Game Code</h3>
          <p className="stat-value">{gameInfo.code}</p>
        </div>
        <div className="stat-box">
          <h3>Time Remaining</h3>
          <p className="stat-value">{formatTime(timer)}</p>
        </div>
      </div>
      
      <div className="players-list">
        <h3>Players</h3>
        {players.map((player, index) => (
          <div key={index} className="player-card">
            <h4>{player.username}</h4>
            <p>Points: <span className="player-points">{player.points}</span></p>
            <div className="video-feed">
              <p>Live Camera Feed</p>
              {/* This is where the actual video stream would be rendered */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpectatorView;