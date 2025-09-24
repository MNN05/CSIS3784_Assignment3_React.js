import React, { useState, useEffect, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import GameLobby from './components/GameLobby.jsx';
import JoinGameScreen from './components/JoinGameScreen.jsx';
import JoinUsernameScreen from './components/JoinUsernameScreen.jsx';
import CreateGameScreen from './components/CreateGameScreen.jsx';
import RoleSelectionScreen from './components/RoleSelection.jsx';
import PlayerWaitingLobby from './components/PlayerWaitingLobby.jsx';
import GameScreen from './components/GameScreen.jsx';
import ColorScanScreen from './components/ColorScanScreen.jsx';

const AppState = {
  WELCOME: 'welcome',
  LOBBY: 'lobby',
  CREATE_GAME: 'create-game',
  DISPLAY_GAME_CODE: 'display-game-code',
  JOIN_GAME: 'join-game',
  JOIN_USERNAME: 'join-username',
  COLOR_SCAN: 'color-scan',
  ROLE_SELECTION: 'role-selection',
  PLAYER_LOBBY: 'player-lobby',
  GAME: 'game'
};

const NEON_COLORS = ['Blue', 'Pink', 'Purple', 'Yellow', 'Green'];

function App() {
  const [appState, setAppState] = useState(AppState.WELCOME);
  const [gameInfo, setGameInfo] = useState({ code: null, username: null, role: null, color: null });
  const [players, setPlayers] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');
    ws.current.onopen = () => console.log('Connected to WebSocket server');

    ws.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      switch (data.type) {
        case 'player-list-update':
          setPlayers(data.players);
          break;
        case 'game-started':
          setAppState(AppState.GAME);
          break;
        default:
          console.log('Unknown message:', data);
      }
    };

    return () => ws.current.close();
  }, []);

  const handleStartClick = () => setAppState(AppState.LOBBY);

  const handleCreateGame = () => {
    const newGameCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setGameInfo({ ...gameInfo, code: newGameCode });
    setAppState(AppState.DISPLAY_GAME_CODE);
  };

  const handleJoinGameCode = (gameCode) => {
    setGameInfo({ ...gameInfo, code: gameCode });
    setAppState(AppState.JOIN_USERNAME);
  };

  const handleJoinUsername = (username) => {
    setGameInfo({ ...gameInfo, username });
    setAppState(AppState.COLOR_SCAN); // go to color scan screen after username
  };

  const handleColorScanComplete = (color) => {
    setGameInfo({ ...gameInfo, color });
    setAppState(AppState.ROLE_SELECTION);
  };

  const handleSelectRole = (role) => {
    setGameInfo({ ...gameInfo, role });
    if (role === 'player') {
      setAppState(AppState.PLAYER_LOBBY);
    } else {
      setAppState(AppState.GAME);
    }
  };

  const handleStartGame = () => {
    ws.current.send(JSON.stringify({ type: 'start-game', gameCode: gameInfo.code }));
  };

  const renderScreen = () => {
    switch (appState) {
      case AppState.WELCOME:
        return <WelcomeScreen onStartClick={handleStartClick} />;
      case AppState.LOBBY:
        return <GameLobby onCreateGame={handleCreateGame} onJoinGame={() => setAppState(AppState.JOIN_GAME)} />;
      case AppState.DISPLAY_GAME_CODE:
        return (
          <CreateGameScreen
            gameCode={gameInfo.code}
            onNext={() => setAppState(AppState.JOIN_USERNAME)}
            ws={ws}
            gameInfo={gameInfo}
            username={gameInfo.username}
          />
        );
      case AppState.JOIN_GAME:
        return <JoinGameScreen onJoinGame={handleJoinGameCode} />;
      case AppState.JOIN_USERNAME:
        return <JoinUsernameScreen onFinalJoin={handleJoinUsername} />;
      case AppState.COLOR_SCAN:
        return <ColorScanScreen ws={ws} gameInfo={gameInfo} onColorSelected={handleColorScanComplete} />;
      case AppState.ROLE_SELECTION:
        return <RoleSelectionScreen onSelectRole={handleSelectRole} />;
      case AppState.PLAYER_LOBBY:
        return <PlayerWaitingLobby gameInfo={gameInfo} players={players} onStartGame={handleStartGame} />;
      case AppState.GAME:
        return <GameScreen gameInfo={gameInfo} ws={ws} players={players} />;
      default:
        return <WelcomeScreen onStartClick={handleStartClick} />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;
