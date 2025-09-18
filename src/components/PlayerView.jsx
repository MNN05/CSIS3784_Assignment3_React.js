import React, { useRef, useEffect, useState } from 'react';
import '../styles/App.css';

const PlayerView = ({ gameInfo }) => {
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
        <button className="shoot-button" onClick={handleShoot}>
          SHOOT
        </button>
      </div>
    </div>
  );
};

export default PlayerView;