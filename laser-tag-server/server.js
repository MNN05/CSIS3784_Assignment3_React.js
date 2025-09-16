const WebSocket = require('ws');

// The port for your WebSocket server
const PORT = 8080;

// Create a new WebSocket server instance
const wss = new WebSocket.Server({ port: PORT });

// Event listener for a new connection
wss.on('connection', ws => {
  console.log('A client has connected!');

  // Event listener for messages from the client
  ws.on('message', message => {
    console.log(`Received message: ${message}`);
    
    // Echo the message back to the client to confirm a working connection
    ws.send(`Server received: ${message}`);
  });

  // Event listener for when the client closes the connection
  ws.on('close', () => {
    console.log('A client has disconnected.');
  });
});

console.log(`WebSocket server is running on port ${PORT}`);