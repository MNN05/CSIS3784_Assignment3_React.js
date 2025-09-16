import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import GameLobby from './components/GameLobby.jsx';
import JoinGameScreen from './components/JoinGameScreen.jsx';
import JoinUsernameScreen from './components/JoinUsernameScreen.jsx';
import CreateGameScreen from './components/CreateGameScreen.jsx';
import RoleSelectionScreen from './components/RoleSelection.jsx';
import PlayerWaitingLobby from './components/PlayerWaitingLobby.jsx';
import GameScreen from './components/GameScreen.jsx';

// A list of neon colors for assigning to players
const NEON_COLORS = ['#00e0ff', '#ff00c8', '#8a00ff', '#ffec00', '#00ff41'];

const AppState = {
  WELCOME: 'welcome',
  LOBBY: 'lobby',
  CREATE_GAME: 'create-game',
  DISPLAY_GAME_CODE: 'display-game-code',
  JOIN_GAME: 'join-game',
  JOIN_USERNAME: 'join-username',
  ROLE_SELECTION: 'role-selection',
  PLAYER_LOBBY: 'player-lobby',
  GAME: 'game'
};

function App() {
  const [appState, setAppState] = useState(AppState.WELCOME);
  const [gameInfo, setGameInfo] = useState({ code: null, username: null, role: null });
  const [players, setPlayers] = useState([]);

  const handleStartClick = () => {
    setAppState(AppState.LOBBY);
  };

  const handleStartGame = () => {
    setAppState(AppState.GAME);
  };

  const handleCreateGame = () => {
    const newGameCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setGameInfo({ ...gameInfo, code: newGameCode });
    setAppState(AppState.DISPLAY_GAME_CODE);
  };

  const handleJoinGameCode = (gameCode) => {
    setGameInfo({ ...gameInfo, code: gameCode });
    setAppState(AppState.JOIN_USERNAME);
  };

  // This function now handles adding the player to the list and assigning a color
  const handleJoinUsername = (username) => {
    const randomColor = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    const newPlayer = { id: players.length + 1, username, color: randomColor };

    setGameInfo({ ...gameInfo, username: username });
    setPlayers([...players, newPlayer]);
    setAppState(AppState.ROLE_SELECTION);
  };

  const handleSelectRole = (role) => {
    if (role === 'player') {
      setGameInfo({ ...gameInfo, role: role });
      setAppState(AppState.PLAYER_LOBBY);
    } else if (role === 'spectator') {
      setGameInfo({ ...gameInfo, role: role });
      setAppState(AppState.GAME);
    }
  };

  const renderScreen = () => {
    switch (appState) {
      case AppState.WELCOME:
        return <WelcomeScreen onStartClick={handleStartClick} />;
      case AppState.LOBBY:
        return (
          <GameLobby
            onCreateGame={handleCreateGame}
            onJoinGame={() => setAppState(AppState.JOIN_GAME)}
          />
        );
      case AppState.DISPLAY_GAME_CODE:
        return (
          <div className="screen-container">
            <h2>Your Game Code</h2>
            <p>Share this code with your teammates.</p>
            <div className="game-code-display">
              <h3>{gameInfo.code}</h3>
            </div>
            <button className="start-button" onClick={() => setAppState(AppState.JOIN_USERNAME)}>
              Next
            </button>
          </div>
        );
      case AppState.JOIN_GAME:
        return <JoinGameScreen onJoinGame={handleJoinGameCode} />;
      case AppState.JOIN_USERNAME:
        return <JoinUsernameScreen onFinalJoin={handleJoinUsername} />;
      case AppState.ROLE_SELECTION:
        return <RoleSelectionScreen onSelectRole={handleSelectRole} />;
      case AppState.PLAYER_LOBBY:
        return <PlayerWaitingLobby gameInfo={gameInfo} players={players} onStartGame={handleStartGame} />;
      case AppState.GAME:
        return <GameScreen gameInfo={gameInfo} />;
      default:
        return <WelcomeScreen onStartClick={handleStartClick} />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;