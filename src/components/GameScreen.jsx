import React from 'react';
import PlayerView from './PlayerView.jsx';
import SpectatorView from './SpectatorView.jsx';

const GameScreen = ({ gameInfo, ws, players }) => {
  if (!gameInfo.role) {
    return <div>Loading game...</div>;
  }

  if (gameInfo.role === 'player') {
    return <PlayerView gameInfo={gameInfo} ws={ws} />;
  }

  if (gameInfo.role === 'spectator') {
    return <SpectatorView players={players} />;
  }

  return <div>Loading game...</div>;
};

export default GameScreen;

