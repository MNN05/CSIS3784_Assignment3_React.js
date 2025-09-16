import React, { useState } from 'react';
import PlayerView from './PlayerView';
import SpectatorView from './SpectatorView';
import PlayerWaitingLobby from './PlayerWaitingLobby';
import '../styles/App.css';

const GameScreen = ({ gameInfo }) => {
  const [isGameStarted, setIsGameStarted] = useState(false);

  // In a real app, this state would be updated via a backend WebSocket event
  const startGame = () => {
    setIsGameStarted(true);
  };
  
  if (gameInfo.role === 'spectator') {
    return <SpectatorView gameInfo={gameInfo} />;
  }
  
  // This logic is for players
  if (!isGameStarted) {
    // This will be triggered when the game creator presses start
    return <PlayerWaitingLobby gameInfo={gameInfo} />;
  } else {
    // This view is shown after the game starts
    return <PlayerView gameInfo={gameInfo} />;
  }
};

export default GameScreen;