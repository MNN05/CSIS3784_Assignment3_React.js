import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import GameLobby from './components/GameLobby.jsx';
import JoinGameScreen from './components/JoinGameScreen.jsx';
import JoinUsernameScreen from './components/JoinUsernameScreen.jsx';
import CreateGameScreen from './components/CreateGameScreen.jsx';
import RoleSelectionScreen from './components/RoleSelectionScreen.jsx';
import ColorSelectionScreen from './components/ColorSelectionScreen.jsx';
import PlayerWaitingLobby from './components/PlayerWaitingLobby.jsx';
import GameScreen from './components/GameScreen.jsx';
import SpectatorView from './components/SpectatorView.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import './styles/App.css';

const AppState = {
  WELCOME: '/',
  LOBBY: '/lobby',
  CREATE_GAME: '/create-game',
  DISPLAY_GAME_CODE: '/display-game-code',
  JOIN_GAME: '/join-game',
  JOIN_USERNAME: '/join-username',
  ROLE_SELECTION: '/role-selection',
  COLOR_SELECTION: '/color-selection',
  PLAYER_LOBBY: '/player-lobby',
  GAME: '/game',
  SPECTATOR_VIEW: '/spectator-view',
  RESULTS: '/results'
};

const NEON_COLORS = ['#00e0ff', '#ff00c8', '#8a00ff', '#ffec00', '#00ff41', '#ff6f00', '#ff0000ff', '#080808ff', '#f7f2f4ff'];

function App() {
  const [gameInfo, setGameInfo] = useState({ code: null, username: null, role: null, isHost: false });
  const [players, setPlayers] = useState([]);
  const [ws, setWs] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Only connect if WebSocket is not already open
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      const websocket = new WebSocket('ws://196.255.149.216:8080');
      setWs(websocket);

      websocket.onopen = () => {
        console.log('Connected to WebSocket server.');
      };

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);

        switch (message.type) {
          case 'player-list-update':
            setPlayers(message.players);
            navigate(AppState.PLAYER_LOBBY);
            break;
          case 'game-started-player':
            navigate(AppState.GAME);
            break;
          case 'game-started-spectator':
            navigate(AppState.SPECTATOR_VIEW);
            break;
          case 'spectator-joined':
            navigate(AppState.SPECTATOR_VIEW);
            break;
          case 'color-taken':
            alert(message.message);
            break;
          case 'game-code-status':
            if (message.isValid) {
              setGameInfo({ ...gameInfo, code: message.gameCode });
              navigate(AppState.JOIN_USERNAME);
            } else {
              alert('Invalid game code. Please try again.');
            }
            break;
          case 'timer-update':
            setTimeRemaining(message.timeRemaining);
            break;
          case 'game-over':
            setPlayers(message.players);
            setTimeRemaining(0);
            navigate(AppState.RESULTS);
            break;
          default:
            break;
        }
      };

      websocket.onclose = () => {
        console.log('Disconnected from WebSocket server.');
        setWs(null);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [ws, gameInfo, navigate]);

  const handleCreateGame = () => {
    const newGameCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setGameInfo({ ...gameInfo, code: newGameCode, isHost: true });
    navigate(AppState.DISPLAY_GAME_CODE);
  };

  const handleJoinGameCode = (gameCode) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'check-game-code',
        gameCode: gameCode
      }));
    } else {
      alert('Could not connect to the server. Please ensure the server is running.');
    }
  };

  const handleJoinUsername = (username) => {
    setGameInfo({ ...gameInfo, username: username });
    if (gameInfo.isHost) {
      if (ws) {
        ws.send(JSON.stringify({ type: 'create-game', gameCode: gameInfo.code }));
      }
    }
    navigate(AppState.ROLE_SELECTION);
  };

  const handleSelectRole = (role) => {
    if (role === 'player') {
      setGameInfo({ ...gameInfo, role: role });
      navigate(AppState.COLOR_SELECTION);
    } else if (role === 'spectator') {
      const player = { username: gameInfo.username, role: 'spectator', points: 0, color: '#f7f2f4ff' };
      if (ws) {
        ws.send(JSON.stringify({
          type: 'join-lobby',
          gameCode: gameInfo.code,
          player
        }));
      }
    }
  };

  const handleSelectColor = (color) => {
    const player = { username: gameInfo.username, color, points: 0, role: 'player' };
    if (ws) {
      ws.send(JSON.stringify({
        type: 'join-lobby',
        gameCode: gameInfo.code,
        player
      }));
    } else {
      console.error('WebSocket not connected. Cannot send join request.');
      setPlayers([...players, player]);
    }
  };
  
  const handleStartGame = () => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'start-game',
        gameCode: gameInfo.code
      }));
    }
  };
  
  const handleExitGame = () => {
    setGameInfo({ code: null, username: null, role: null, isHost: false });
    setPlayers([]);
    setTimeRemaining(0);
    navigate(AppState.WELCOME);
  };

  return (
    <div className="App">
      <Routes>
        <Route path={AppState.WELCOME} element={<WelcomeScreen onStartClick={() => navigate(AppState.LOBBY)} />} />
        <Route path={AppState.LOBBY} element={<GameLobby onCreateGame={handleCreateGame} onJoinGame={() => navigate(AppState.JOIN_GAME)} />} />
        <Route path={AppState.DISPLAY_GAME_CODE} element={
          <div className="screen-container">
            <h2>Your Game Code</h2>
            <p>Share this code with your teammates.</p>
            <div className="game-code-display">
              <h3>{gameInfo.code}</h3>
            </div>
            <button className="start-button" onClick={() => navigate(AppState.JOIN_USERNAME)}>Next</button>
          </div>
        } />
        <Route path={AppState.JOIN_GAME} element={<JoinGameScreen onJoinGame={handleJoinGameCode} />} />
        <Route path={AppState.JOIN_USERNAME} element={<JoinUsernameScreen onFinalJoin={handleJoinUsername} />} />
        <Route path={AppState.ROLE_SELECTION} element={<RoleSelectionScreen onSelectRole={handleSelectRole} />} />
        <Route path={AppState.COLOR_SELECTION} element={<ColorSelectionScreen onSelectColor={handleSelectColor} />} />
        <Route path={AppState.PLAYER_LOBBY} element={<PlayerWaitingLobby gameInfo={gameInfo} players={players} onStartGame={handleStartGame} />} />
        <Route path={AppState.GAME} element={<GameScreen gameInfo={gameInfo} players={players} timeRemaining={timeRemaining} />} />
        <Route path={AppState.SPECTATOR_VIEW} element={<SpectatorView gameInfo={gameInfo} players={players} timeRemaining={timeRemaining} />} />
        <Route path={AppState.RESULTS} element={<ResultsScreen players={players} onExitGame={handleExitGame} />} />
      </Routes>
    </div>
  );
}

export default App;