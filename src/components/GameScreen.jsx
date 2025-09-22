import React from 'react';
import '../styles/App.css';

const GameScreen = ({ gameInfo, players, timeRemaining }) => {
    // Find the current player's data from the players array
    const currentPlayer = players.find(p => p.username === gameInfo.username);

    // Format the timeRemaining in seconds to MM:SS format
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    const handleButtonClick = () => {
        // Vibrate the device
        if (navigator.vibrate) {
            navigator.vibrate(100); // Vibrate for 100ms
        }

        // Play a laser sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'sine'; // A clean, pure tone
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
            oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.1); // Quickly ramp up
            
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15); // Fade out quickly

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2); // Stop after 200ms
        } catch (e) {
            console.error('Web Audio API is not supported in this browser.', e);
        }
    };

    return (
        <div className="screen-container">
            <div className="game-header">
                {currentPlayer && (
                    <h3 className="player-name" style={{ color: currentPlayer.color }}>
                        {currentPlayer.username}
                    </h3>
                )}
                <h3 className="timer">{formatTime(timeRemaining)}</h3>
            </div>

            <div className="game-stats">
                <p>Game Code: {gameInfo.code}</p>
                {currentPlayer && (
                    <p>Points: {currentPlayer.points}</p>
                )}
            </div>

            <div className="camera-feed-container">
                <div className="video-feed-placeholder">
                    <p>Your live camera feed here</p>
                </div>
            </div>

            <button
                className="action-button"
                onClick={handleButtonClick}
            >
                Press to shoot
            </button>
        </div>
    );
};

export default GameScreen;