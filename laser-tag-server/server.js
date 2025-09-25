const WebSocket = require('ws');
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
        const { type, gameCode, player, shooterUsername, targetUsername, username, color } = data;

        let game;
        if (gameCode) {
            game = games[gameCode];
        }

        switch (type) {
            case 'create-game':
                console.log(`Creating new game with code: ${gameCode}`);
                games[gameCode] = { players: [], clients: new Set(), hostWs: ws, timer: null };
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
                if (game) {
                    if (player.role === 'player') {
                        const colorTaken = game.players.some(p => p.color === player.color && p.role === 'player');
                        if (colorTaken) {
                            ws.send(JSON.stringify({
                                type: 'color-taken',
                                message: 'This color is already taken. Please choose another.'
                            }));
                            return;
                        }
                    }
                    
                    // Determine if the joining player is the host
                    const isHost = ws === game.hostWs;

                    const existingPlayerIndex = game.players.findIndex(p => p.username === player.username);
                    if (existingPlayerIndex !== -1) {
                        game.players[existingPlayerIndex] = { ...game.players[existingPlayerIndex], ...player, ws, isHost };
                    } else {
                        game.players.push({ ...player, ws, points: 0, isHost });
                    }

                    game.clients.add(ws);
                    ws.gameCode = gameCode;
                    ws.username = player.username;
                    ws.role = player.role;

                    if (player.role === 'spectator') {
                        ws.send(JSON.stringify({ type: 'spectator-joined' }));
                    }

                    // Correctly format the player list for broadcast
                    const playersWithoutWs = game.players.map(p => ({
                        username: p.username,
                        color: p.color,
                        role: p.role,
                        points: p.points,
                        isHost: p.isHost
                    }));

                    broadcastToGame(gameCode, {
                        type: 'player-list-update',
                        players: playersWithoutWs
                    });
                }
                break;
            case 'player-color-selected':
                console.log(`Player ${username} selected color ${color} in game ${gameCode}`);
                if (game) {
                    const colorTaken = game.players.some(p => p.color === color);
                    if (colorTaken) {
                        ws.send(JSON.stringify({
                            type: 'color-selection-failed',
                            message: 'This color is already taken. Please choose another.'
                        }));
                    } else {
                       const playertoUpdate = game.players.find(p => p.username === username);
                       if (playertoUpdate) {
                           playertoUpdate.color = color;
                           ws.send(JSON.stringify({
                               type: 'color-selection-success',
                               color: color
                           }));
                       }

                    const playersWithoutWs = game.players.map(p => ({
                        username: p.username,
                        color: p.color,
                        role: p.role,
                        points: p.points,
                        isHost: p.isHost
                    }));
                    broadcastToGame(gameCode, {
                        type: 'player-list-update',
                        players: playersWithoutWs
                    });
                }
                }
                break;

            case 'start-game':
                if (ws === game.hostWs && !game.timer) {
                    console.log(`Host is starting game ${gameCode}`);
                    let timeRemaining = 300;
                    
                    for (const client of game.clients) {
                        if (client.readyState === WebSocket.OPEN) {
                            if (client.role === 'player') {
                                client.send(JSON.stringify({ type: 'game-started-player' }));
                            } else if (client.role === 'spectator') {
                                client.send(JSON.stringify({ type: 'game-started-spectator' }));
                            }
                        }
                    }

                    game.timer = setInterval(() => {
                        timeRemaining--;
                        broadcastToGame(gameCode, {
                            type: 'timer-update',
                            timeRemaining: timeRemaining
                        });

                        if (timeRemaining <= 0) {
                            clearInterval(game.timer);
                            game.timer = null;
                            const finalPlayers = game.players.map(p => ({ ...p, ws: undefined }));
                            broadcastToGame(gameCode, { type: 'game-over', players: finalPlayers });
                            console.log(`Game over for ${gameCode}`);
                        }
                    }, 1000);
                } else {
                    console.log('Non-host tried to start the game or game is already in progress.');
                }
                break;

            case 'hit':
                if (game) {
                    const shooter = game.players.find(p => p.username === shooterUsername);
                    const target = game.players.find(p => p.username === targetUsername);

                    if (shooter && target) {
                        console.log(`${shooter.username} hit ${target.username}`);
                        if (shooter.color === target.color) {
                            shooter.points -= 5;
                            console.log(`${shooter.username} lost 5 points (friendly fire). New score: ${shooter.points}`);
                        } else {
                            shooter.points += 15;
                            console.log(`${shooter.username} gained 15 points. New score: ${shooter.points}`);
                        }

                        const playersWithoutWs = game.players.map(p => ({
                            username: p.username,
                            color: p.color,
                            role: p.role,
                            points: p.points,
                            isHost: p.isHost
                        }));
                        broadcastToGame(gameCode, {
                            type: 'player-list-update',
                            players: playersWithoutWs
                        });
                    }
                }
                break;

            default:
                console.log('Unknown message type received:', type);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        for (const gameCode in games) {
            const game = games[gameCode];
            const playerIndex = game.players.findIndex(p => p.ws === ws);
            if (playerIndex !== -1) {
                const player = game.players.splice(playerIndex, 1)[0];
                console.log(`Player ${player.username} left game ${gameCode}.`);

                game.clients.delete(ws);

                if (game.clients.size === 0) {
                    if (game.timer) {
                        clearInterval(game.timer);
                    }
                    delete games[gameCode];
                    console.log(`Game ${gameCode} deleted as no clients remain.`);
                } else {
                    const playersWithoutWs = game.players.map(p => ({ ...p, ws: undefined }));
                    broadcastToGame(gameCode, {
                        type: 'player-list-update',
                        players: playersWithoutWs
                    });
                }
                break;
            }
        }
    });

    ws.on('error', error => {
        console.error('WebSocket Error:', error);
    });
});