import React, { useRef, useEffect, useState } from 'react';
import { startColorDetection } from '../colourDetection';

const ColorScanScreen = ({ ws, gameInfo, onSelectColor, statusMessage, errorMessage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detectedColor, setDetectedColor] = useState(null);
  const [localStatus, setLocalStatus] = useState('Scanning...');

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setStatusMessage('Error accessing webcam.');
      }
    };
    getVideo();
  }, []);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      startColorDetection(videoRef.current, canvasRef.current, (color) => {
        setDetectedColor(color);
        setLocalStatus(`Detected Color: ${color}`);
      });
    }
  }, [videoRef, canvasRef]);

  // No ws.onmessage here! All WebSocket handling is in App.jsx

  const handleConfirmColor = () => {
    if (!detectedColor) return;
    setLocalStatus('Submitting color...');
    if (ws && gameInfo?.code && gameInfo?.username) {
      ws.send(JSON.stringify({
        type: 'player-color-selected',
        gameCode: gameInfo.code,
        username: gameInfo.username,
        color: detectedColor
      }));
    }
  };

  return (
    <div className="screen-container">
      <h2>Scan Your Color</h2>
      <video ref={videoRef} autoPlay muted playsInline width={640} height={480} />
      <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
      <p>Status: <strong>{statusMessage || localStatus}</strong></p>
      {errorMessage && <p style={{ color: 'var(--neon-pink)' }}>{errorMessage}</p>}
      <button className="start-button" onClick={handleConfirmColor} disabled={!detectedColor}>
        Confirm Color
      </button>
    </div>
  );
};

export default ColorScanScreen;