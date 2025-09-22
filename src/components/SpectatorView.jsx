import React from 'react';
import '../styles/App.css';

const SpectatorView = ({ gameInfo, players, timeRemaining }) => {
    // Format the timeRemaining in seconds to MM:SS format
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

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
                    <p className="stat-value">{formatTime(timeRemaining)}</p>
                </div>
            </div>
            
            <div className="players-list">
                <h3>Players</h3>
                {players.filter(p => p.role === 'player').map((player, index) => (
                    <div key={index} className="player-card">
                        <h4 style={{ color: player.color }}>{player.username}</h4>
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