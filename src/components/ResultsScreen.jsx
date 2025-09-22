import React from 'react';
import '../styles/App.css';

const ResultsScreen = ({ players, onExitGame }) => {
    // Sort players by points in descending order
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
    const winner = sortedPlayers[0];

    return (
        <div className="screen-container">
            <h2>Game Over!</h2>
            {winner && (
                <div className="winner-display">
                    <h3>The Winner Is:</h3>
                    <p style={{ color: winner.color }}>
                        {winner.username} {winner === sortedPlayers[0] && '👑'}
                    </p>
                </div>
            )}
            <h3>Final Scores:</h3>
            <ul className="player-list">
                {sortedPlayers.map(player => (
                    <li key={player.username}>
                        <span className="player-name" style={{ color: player.color }}>{player.username}</span>
                        <span className="player-score">{player.points} points</span>
                    </li>
                ))}
            </ul>
            <button className="exit-button" onClick={onExitGame}>Exit to Welcome Screen</button>
        </div>
    );
};

export default ResultsScreen;