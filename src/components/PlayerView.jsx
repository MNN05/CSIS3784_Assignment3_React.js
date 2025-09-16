import React from 'react';

const PlayerView = ({ gameInfo }) => {
  return (
    <div>
      <h3>Player View</h3>
      <p>Welcome, {gameInfo.username}! Game Code: {gameInfo.code}</p>
      {/* This is where you will render the camera view, HUD, and game controls */}
      <p>This is where your computer vision game will be played.</p>
    </div>
  );
};

export default PlayerView;