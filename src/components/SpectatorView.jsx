import React from 'react';

const SpectatorView = ({ players }) => {
  return (
    <div className="spectator-container">
      <div className="spectator-header">
        <h2 className="spectator-title">Spectator View</h2>
      </div>
      <div className="players-scroll">
        {players.length === 0 && <p>No players have joined yet...</p>}
        {players.map((player) => (
          <div key={player.username} className="player-card">
            <p><strong>{player.username}</strong></p>
            <p>Color: <span style={{ color: player.color.toLowerCase() }}>{player.color}</span></p>
            <p>Points: {player.points}</p>
            <div className="camera-placeholder">Camera Feed Placeholder</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpectatorView;
