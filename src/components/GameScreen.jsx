import React, { useEffect, useRef, useState } from 'react';

const GameScreen = ({ ws, gameInfo, players, timeRemaining }) => {
    // Add a safety check to prevent rendering before data is available
    if (!gameInfo || !players) {
        return <div>Loading...</div>;
    }

    const currentPlayer = players.find(p => p.username === gameInfo.username);
    const isPlayer = currentPlayer?.role === 'player';
    const isSpectator = currentPlayer?.role === 'spectator';
    
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const peerConnections = useRef({});

    // This effect handles getting the local camera stream and setting up the WebSocket listener for WebRTC signaling
    useEffect(() => {
        // Function to get the local video and audio stream from the user's camera
        const getLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                // Check if the localVideoRef is available before assigning the stream
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                return stream;
            } catch (err) {
                console.error("Error accessing camera and microphone:", err);
                return null;
            }
        };

        const setupWebSocket = async () => {
            let localStream = null;
            if (isPlayer) {
                localStream = await getLocalStream();
                if (!localStream) {
                    console.error('Local stream could not be obtained. Cannot set up WebRTC for player.');
                    return;
                }
            }

            // WebSocket event listener for incoming WebRTC signaling messages
            if (ws) {
                ws.onmessage = async (event) => {
                    const message = JSON.parse(event.data);
                    
                    // Logic for both players and spectators
                    if (message.type === 'offer' && message.targetUsername === gameInfo.username) {
                        console.log('Received offer from:', message.senderUsername);
                        let pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
                        peerConnections.current[message.senderUsername] = pc;
    
                        // Add local stream for players
                        if (isPlayer && localStream) {
                            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                        }
    
                        pc.ontrack = (event) => {
                            if (remoteVideoRefs.current[message.senderUsername]) {
                                remoteVideoRefs.current[message.senderUsername].srcObject = event.streams[0];
                            }
                        };
    
                        pc.onicecandidate = (event) => {
                            if (event.candidate) {
                                ws.send(JSON.stringify({
                                    type: 'ice-candidate',
                                    gameCode: gameInfo.code,
                                    senderUsername: gameInfo.username,
                                    targetUsername: message.senderUsername,
                                    candidate: event.candidate,
                                }));
                            }
                        };
    
                        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        ws.send(JSON.stringify({
                            type: 'answer',
                            gameCode: gameInfo.code,
                            senderUsername: gameInfo.username,
                            targetUsername: message.senderUsername,
                            answer: answer,
                        }));
                    } else if (message.type === 'answer' && message.targetUsername === gameInfo.username) {
                        console.log('Received answer from:', message.senderUsername);
                        const pc = peerConnections.current[message.senderUsername];
                        if (pc) {
                            await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
                        }
                    } else if (message.type === 'ice-candidate' && message.targetUsername === gameInfo.username) {
                        const pc = peerConnections.current[message.senderUsername];
                        if (pc && message.candidate) {
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
                            } catch (e) {
                                console.error('Error adding received ICE candidate', e);
                            }
                        }
                    }
                };
            }
        };

        setupWebSocket();

        // Cleanup function to stop the stream when the component unmounts
        return () => {
            if (localVideoRef.current && localVideoRef.current.srcObject) {
                localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            // Close all peer connections
            Object.values(peerConnections.current).forEach(pc => pc.close());
        };
    }, [ws, gameInfo.username]);

    // This effect handles creating peer connections and sending offers to other players.
    // This only runs for players, not spectators.
    useEffect(() => {
        if (!isPlayer) return;

        // Function to create a peer connection and send an an offer
        const createPeerConnection = async (targetUsername, localStream) => {
            if (!ws || !localStream) return;

            console.log('Creating RTCPeerConnection for:', targetUsername);
            const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
            peerConnections.current[targetUsername] = pc;

            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    ws.send(JSON.stringify({
                        type: 'ice-candidate',
                        gameCode: gameInfo.code,
                        senderUsername: gameInfo.username,
                        targetUsername: targetUsername,
                        candidate: event.candidate,
                    }));
                }
            };

            pc.ontrack = (event) => {
                if (remoteVideoRefs.current[targetUsername]) {
                    remoteVideoRefs.current[targetUsername].srcObject = event.streams[0];
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            ws.send(JSON.stringify({
                type: 'offer',
                gameCode: gameInfo.code,
                senderUsername: gameInfo.username,
                targetUsername: targetUsername,
                offer: offer,
            }));
        };

        // Get the local stream before initiating peer connections
        const localStream = localVideoRef.current?.srcObject;
        if (localStream) {
            // Initiate connections with all other players and spectators
            const otherPlayers = players.filter(p => p.username !== gameInfo.username);
            otherPlayers.forEach(player => {
                // Only create a new connection if one doesn't already exist
                if (!peerConnections.current[player.username]) {
                    createPeerConnection(player.username, localStream);
                }
            });
        }
    }, [players, ws, gameInfo.code, gameInfo.username, isPlayer]); // Re-run when players list or role changes

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    const sendHit = (targetUsername) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'hit',
                gameCode: gameInfo.code,
                shooterUsername: gameInfo.username,
                targetUsername: targetUsername
            }));
        }
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

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.error('Web Audio API is not supported in this browser.', e);
        }

        const otherPlayers = players.filter(p => p.username !== gameInfo.username && p.role === 'player');
        if (otherPlayers.length > 0) {
            const randomTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
            sendHit(randomTarget.username);
        }
    };

    return (
        <>
            <style>
                {`
                .screen-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background-color: #1a1a2e;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .game-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    max-width: 600px;
                    margin-bottom: 20px;
                }

                .player-name {
                    font-size: 1.5rem;
                    font-weight: bold;
                    text-shadow: 0 0 10px currentColor;
                }

                .timer {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #00ffc8;
                    text-shadow: 0 0 10px #00ffc8;
                }

                .game-stats {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .game-stats p {
                    margin: 5px 0;
                    font-size: 1rem;
                    color: #aaa;
                }

                .video-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    width: 100%;
                    max-width: 900px;
                    margin-bottom: 30px;
                }

                .video-card {
                    background-color: #2e2e4e;
                    border-radius: 15px;
                    padding: 10px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    position: relative;
                }

                .video-card h4 {
                    margin: 0 0 10px 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .player-video {
                    width: 100%;
                    height: auto;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 255, 200, 0.5);
                }

                .action-button {
                    background-color: #ff2e63;
                    color: #fff;
                    font-size: 1.5rem;
                    font-weight: bold;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 50px;
                    cursor: pointer;
                    box-shadow: 0 8px 15px rgba(255, 46, 99, 0.4);
                    transition: all 0.3s ease;
                }

                .action-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 20px rgba(255, 46, 99, 0.6);
                }

                .player-scores {
                    margin-top: 30px;
                    width: 100%;
                    max-width: 600px;
                }

                .player-scores h3 {
                    text-align: center;
                    font-size: 1.8rem;
                    margin-bottom: 15px;
                    color: #00ffc8;
                }

                .score-list {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 10px;
                }

                .score-list li {
                    background-color: #2e2e4e;
                    padding: 10px 20px;
                    border-radius: 20px;
                    font-size: 1.1rem;
                    font-weight: 500;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s ease;
                }

                .score-list li:hover {
                    transform: translateY(-2px);
                }

                .player-name {
                    margin-right: 10px;
                    font-weight: bold;
                }
                `}
            </style>
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

                <div className="video-grid">
                    {/* Render local video feed only if the user is a player */}
                    {isPlayer && (
                        <div className="video-card local-video-card">
                            <h4>Your Live Feed</h4>
                            <video ref={localVideoRef} autoPlay playsInline muted className="player-video"></video>
                        </div>
                    )}

                    {/* Render all other players' video feeds */}
                    {players.filter(p => p.username !== gameInfo.username && p.role === 'player').map((player, index) => (
                        <div key={player.username} className="video-card">
                            <h4 style={{ color: player.color }}>{player.username}</h4>
                            {/* The remote video will be attached to this element */}
                            <video ref={el => remoteVideoRefs.current[player.username] = el} autoPlay playsInline className="player-video"></video>
                        </div>
                    ))}
                </div>

                {/* Render the shoot button only if the user is a player */}
                {isPlayer && (
                    <button
                        className="action-button"
                        onClick={handleButtonClick}
                    >
                        Press to shoot
                    </button>
                )}

                <div className="player-scores">
                    <h3>Scores</h3>
                    <ul className="score-list">
                        {players.map(player => (
                            <li key={player.username}>
                                <span className="player-name" style={{ color: player.color }}>{player.username}: {player.points}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default GameScreen;