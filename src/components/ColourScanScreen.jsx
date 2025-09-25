import React, { useRef, useEffect, useState } from 'react';
import { startColorDetection } from '../colourDetection';

const ColorScanScreen = ({ ws, gameInfo, onColorSelected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detectedColor, setDetectedColor] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Scanning...');

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
        setStatusMessage(`Detected Color: ${color}`);
      });
    }
  }, [videoRef, canvasRef]);

  useEffect(() => {
    if (ws?.current) {
      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'color-selection-success') {
          // The server confirmed the color, now we can proceed
          onColorSelected(message.color);
        } else if (message.type === 'color-selection-failed') {
          // The color was already taken, so display a message
          setStatusMessage('That color is already taken. Please try another!');
        }
      };
    }
  }, [ws, onColorSelected]);

  const handleConfirmColor = () => {
    if (!detectedColor) return;
    setStatusMessage('Submitting color...');
    
    if (ws?.current && gameInfo?.code && gameInfo?.username) {
      ws.current.send(JSON.stringify({
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
      <p>Status: <strong>{statusMessage}</strong></p>
      <button className="start-button" onClick={handleConfirmColor} disabled={!detectedColor}>
        Confirm Color
      </button>
    </div>
  );
};

export default ColorScanScreen;