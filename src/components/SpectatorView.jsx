import React from 'react';
import '../styles/App.css';

const SpectatorView = ({ gameInfo, players, timeRemaining, onStartGame }) => {
    // Find the current player in the players array to check their status
    const currentPlayer = players.find(p => p.username === gameInfo.username);
    const isHost = currentPlayer ? currentPlayer.isHost : false;
    
    // Check if there are at least two players
    const canStartGame = players.filter(p => p.role === 'player').length >= 2;

    // A flag to determine if the game is in progress
    const gameHasStarted = timeRemaining > 0;

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
                {gameHasStarted && (
                    <div className="stat-box">
                        <h3>Time Remaining</h3>
                        <p className="stat-value">{formatTime(timeRemaining)}</p>
                    </div>
                )}
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

            {/* Render the start button only if the user is the host AND the game hasn't started */}
            {isHost && !gameHasStarted && (
                <button
                    className="start-button"
                    onClick={onStartGame}
                    disabled={!canStartGame}
                >
                    Start Game
                </button>
            )}
        </div>
    );
};

export default SpectatorView;