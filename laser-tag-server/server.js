const WebSocket = require('ws');
//const server = new WebSocket.Server({ port: 8080 });
const server = new WebSocket.Server({ host: '0.0.0.0', port: 8080 });

console.log('WebSocket server is running on port 8080');

const games = {};

const broadcastToGame = (gameCode, message) => {
    if (games[gameCode]) {
        for (const client of games[gameCode].clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        }
    }
};

server.on('connection', ws => {
    console.log('Client connected');
    ws.on('message', message => {
        const data = JSON.parse(message);
        const { type, gameCode, player } = data;

        switch (type) {
            case 'create-game':
                console.log(`Creating new game with code: ${gameCode}`);
                games[gameCode] = { players: [], clients: new Set(), hostId: ws._socket.remoteAddress, timer: null };
                ws.gameCode = gameCode;
                ws.username = 'Host';
                games[gameCode].clients.add(ws);
                break;

            case 'check-game-code':
                console.log(`Checking game code: ${gameCode}`);
                const isValid = !!games[gameCode];
                ws.send(JSON.stringify({
                    type: 'game-code-status',
                    isValid: isValid,
                    gameCode: gameCode
                }));
                break;

            case 'join-lobby':
                console.log(`User ${player.username} joining game ${gameCode} as ${player.role}`);
                if (games[gameCode]) {
                    if (player.role === 'player') {
                        const colorTaken = games[gameCode].players.some(p => p.color === player.color);
                        if (colorTaken) {
                            ws.send(JSON.stringify({
                                type: 'color-taken',
                                message: 'This color is already taken. Please choose another.'
                            }));
                            return;
                        }
                    }

                    const existingPlayerIndex = games[gameCode].players.findIndex(p => p.username === player.username);
                    if (existingPlayerIndex !== -1) {
                        games[gameCode].players[existingPlayerIndex].isHost = (ws._socket.remoteAddress === games[gameCode].hostId);
                        games[gameCode].players[existingPlayerIndex].color = player.color;
                        games[gameCode].players[existingPlayerIndex].role = player.role;
                    } else {
                        player.isHost = (ws._socket.remoteAddress === games[gameCode].hostId);
                        games[gameCode].players.push(player);
                    }

                    games[gameCode].clients.add(ws);
                    ws.gameCode = gameCode;
                    ws.username = player.username;
                    ws.role = player.role;

                    if (player.role === 'spectator') {
                        ws.send(JSON.stringify({ type: 'spectator-joined' }));
                    }
                    
                    broadcastToGame(gameCode, {
                        type: 'player-list-update',
                        players: games[gameCode].players.map(p => ({ ...p, ws: undefined }))
                    });
                }
                break;

            case 'start-game':
                if (ws._socket.remoteAddress === games[gameCode].hostId && !games[gameCode].timer) {
                    console.log(`Host is starting game ${gameCode}`);
                    let timeRemaining = 300;
                    
                    for (const client of games[gameCode].clients) {
                        if (client.readyState === WebSocket.OPEN) {
                            if (client.role === 'player') {
                                client.send(JSON.stringify({ type: 'game-started-player' }));
                            } else if (client.role === 'spectator') {
                                client.send(JSON.stringify({ type: 'game-started-spectator' }));
                            }
                        }
                    }

                    games[gameCode].timer = setInterval(() => {
                        timeRemaining--;
                        broadcastToGame(gameCode, {
                            type: 'timer-update',
                            timeRemaining: timeRemaining
                        });

                        if (timeRemaining <= 0) {
                            clearInterval(games[gameCode].timer);
                            games[gameCode].timer = null;
                            broadcastToGame(gameCode, { type: 'game-over', players: games[gameCode].players.map(p => ({ ...p, ws: undefined })) });
                            console.log(`Game over for ${gameCode}`);
                        }
                    }, 1000);
                } else {
                    console.log('Non-host tried to start the game or game is already in progress.');
                }
                break;

            case 'hit':
                // (Logic for handling a hit)
                break;

            default:
                console.log('Unknown message type received:', type);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        if (ws.gameCode && games[ws.gameCode]) {
            games[ws.gameCode].clients.delete(ws);
            if (ws.role === 'player') {
                const playerIndex = games[ws.gameCode].players.findIndex(p => p.username === ws.username);
                if (playerIndex !== -1) {
                    games[ws.gameCode].players.splice(playerIndex, 1);
                    broadcastToGame(ws.gameCode, {
                        type: 'player-list-update',
                        players: games[ws.gameCode].players.map(p => ({ ...p, ws: undefined }))
                    });
                }
            }

            if (games[ws.gameCode].clients.size === 0) {
                if (games[ws.gameCode].timer) {
                    clearInterval(games[ws.gameCode].timer);
                }
                delete games[ws.gameCode];
                console.log(`Game ${ws.gameCode} is now empty and has been removed.`);
            }
        }
    });

    ws.on('error', error => {
        console.error('WebSocket Error:', error);
    });
});