import React, { useRef, useEffect, useState } from 'react';
import '../styles/App.css';
import { startColorDetection } from '../colourDetection.js';

const COLOR_HEX_MAP = {
  Blue: '#00e0ff',
  Pink: '#ff00c8',
  Purple: '#8a00ff',
  Yellow: '#ffec00',
  Green: '#00ff41'
};

const PlayerView = ({ gameInfo, ws, players }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [points, setPoints] = useState(0);

  // Update points when players array changes
  useEffect(() => {
    if (players && players.length > 0) {
      const me = players.find(p => p.username === gameInfo.username);
      setPoints(me ? me.points : 0);
    }
  }, [players, gameInfo.username]);

  // Start camera and color detection
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          // Set canvas size to match video
          canvasRef.current.width = videoRef.current.videoWidth || 640;
          canvasRef.current.height = videoRef.current.videoHeight || 480;

          startColorDetection(videoRef.current, canvasRef.current, (color) => {
            if (ws.current && color) {
              ws.current.send(JSON.stringify({
                type: 'hit',
                gameCode: gameInfo.code,
                shooter: gameInfo.username,
                hitColor: color
              }));
            }
          });
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }

    startCamera();
  }, [ws, gameInfo]);

  const myColor = players?.find(p => p.username === gameInfo.username)?.color;

  return (
    <div className="player-view-container">
      <div className="hud-top">
        <div className="hud-info">Game Code: {gameInfo.code}</div>
        <div className="hud-info">Username: {gameInfo.username}</div>
        <div className="hud-info">Points: {points}</div>
      </div>

      <div className="camera-container">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>

      <div className="hud-bottom">
        {myColor && (
          <p style={{ color: COLOR_HEX_MAP[myColor] }}>
            Your color indicator
          </p>
        )}
      </div>
    </div>
  );
};

export default PlayerView;
