import React, { useEffect, useState } from 'react';
import '../styles/App.css';

const PlayerWaitingLobby = ({ ws, gameInfo, onStartGame }) => {
    const [players, setPlayers] = useState([]);

    // Listen for WebSocket messages to update the player list
    useEffect(() => {
        if (ws?.current) {
            ws.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'lobby-update') {
                    setPlayers(message.players);
                }
            };
        }
    }, [ws]);

    // Find the current user in the players array to check their status
    const currentPlayer = players.find(p => p.username === gameInfo.username);
    const isHost = currentPlayer ? currentPlayer.isHost : false;

    // Check if there are at least two players
    const canStartGame = players.length >= 2;

    return (
        <div className="screen-container">
            <h2>Game Lobby</h2>
            <p className="game-code-label">Game Code: {gameInfo.code}</p>
            <h3>Players Joined ({players.length})</h3>
            <ul className="player-list">
                {players.map(player => (
                    <li key={player.username}>
                        {/* The username text is now the player's chosen color */}
                        <span className="player-name" style={{ color: player.color }}>{player.username}</span>
                        {/* A person icon to distinguish players visually */}
                        <span className="player-icon">👤</span>
                        {player.isHost && <span className="host-badge">(Host)</span>}
                    </li>
                ))}
            </ul>
            {isHost && (
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

export default PlayerWaitingLobby;