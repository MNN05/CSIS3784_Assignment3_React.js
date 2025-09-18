import React from 'react';
import PlayerView from './PlayerView';
import SpectatorView from './SpectatorView';
import '../styles/App.css';

const GameScreen = ({ gameInfo }) => {
  // Pass the entire gameInfo object to the views
  if (gameInfo.role === 'player') {
    return <PlayerView gameInfo={gameInfo} />;
  } else if (gameInfo.role === 'spectator') {
    return <SpectatorView gameInfo={gameInfo} />;
  } else {
    return <div>Loading game...</div>;
  }
};

export default GameScreen;