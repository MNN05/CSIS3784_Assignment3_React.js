const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// This object will hold the state for all games.
// The key is the game code, and the value is the game object.
const games = {};

// Helper function to send a message to all clients in a specific game
const broadcastToGame = (gameCode, message) => {
  if (games[gameCode]) {
    games[gameCode].clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
};

wss.on('connection', ws => {
  console.log('Client connected!');
  
  // Store connection details with the WebSocket instance
  ws.gameCode = null;
  ws.username = null;

  ws.on('message', message => {
    const data = JSON.parse(message);
    const { type, gameCode, player, shooter, hitColor } = data;

    switch (type) {
      case 'join-lobby':
        // A player is joining a game lobby.
        console.log(`Player ${player.username} joining game ${gameCode}`);
        
        // Find or create the game
        if (!games[gameCode]) {
          games[gameCode] = { players: [], clients: new Set(), state: 'waiting' };
        }
        
        // Add player to the game if they are not already there
        const existingPlayer = games[gameCode].players.find(p => p.username === player.username);
        if (!existingPlayer) {
          games[gameCode].players.push(player);
        }

        // Add the client to the set of clients for this game
        games[gameCode].clients.add(ws);
        ws.gameCode = gameCode;
        ws.username = player.username;

        // Broadcast the updated player list to all clients in this game
        broadcastToGame(gameCode, { 
          type: 'player-list-update',
          players: games[gameCode].players 
        });
        break;

      case 'start-game':
        // The host has requested to start the game
        console.log(`Starting game ${gameCode}`);
        if (games[gameCode]) {
          games[gameCode].state = 'in-progress';
          broadcastToGame(gameCode, { type: 'game-started' });
        }
        break;

      case 'hit':
        // A player has hit a target.
        if (games[gameCode]) {
          let updatedPlayers = [...games[gameCode].players];
          const shooterPlayer = updatedPlayers.find(p => p.username === shooter);
          const targetPlayer = updatedPlayers.find(p => p.color === hitColor);

          if (shooterPlayer) {
            if (shooterPlayer.color === hitColor) {
              // They hit their own color - lose 3 points
              shooterPlayer.points -= 3;
            } else if (targetPlayer) {
              // They hit an opponent - gain 10 points
              shooterPlayer.points += 10;
            }
          }
          
          // Update the player list and broadcast the score update
          games[gameCode].players = updatedPlayers;
          broadcastToGame(gameCode, {
            type: 'player-list-update',
            players: updatedPlayers
          });
        }
        break;
      
      default:
        console.log('Unknown message type:', type);
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
    if (ws.gameCode && games[ws.gameCode]) {
      // Remove the disconnected client from the game's client set
      games[ws.gameCode].clients.delete(ws);
      console.log(`Client disconnected from game ${ws.gameCode}`);

      // Optional: Clean up empty game rooms
      if (games[ws.gameCode].clients.size === 0) {
        delete games[ws.gameCode];
        console.log(`Game ${ws.gameCode} is now empty and has been removed.`);
      }
    }
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server is running on port 8080.');