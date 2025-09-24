import React, { useRef, useEffect } from 'react';

const PlayerView = ({ gameInfo, ws }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function startCamera() {
      try {
        // Request high-resolution camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }, // HD
          audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Optional: if you use a canvas for color detection
        const canvas = canvasRef.current;
        canvas.width = 1280;
        canvas.height = 720;
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="player-view-container">
      <div className="hud-top">
        <p className="hud-info">Username: {gameInfo.username}</p>
        <p className="hud-info">Color: {gameInfo.color}</p>
      </div>

      <div className="camera-container">
        <video ref={videoRef} />
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PlayerView;
