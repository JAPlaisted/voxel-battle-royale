// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createInitialPlayer, updatePlayerState, removePlayer } = require('./gameState');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static('public'));

let players = {}; // key: socket.id, value: player object

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create a new player with a random spawn and default human state
  const newPlayer = createInitialPlayer(socket.id);
  players[socket.id] = newPlayer;

  // Send initialization data to the new player: his own info and all current players
  socket.emit('init', { self: newPlayer, players });

  // Notify others about the new player joining
  socket.broadcast.emit('playerJoined', newPlayer);

  // Handle movement updates from the client
  socket.on('move', (data) => {
    // data: { x, y, z, rotation }
    updatePlayerState(socket.id, data);
    // Broadcast movement update to all other clients
    socket.broadcast.emit('playerMoved', { id: socket.id, data });
  });

  // Handle a simple attack event (expand this later for combat logic)
  socket.on('attack', (data) => {
    io.emit('playerAttacked', { attacker: socket.id, ...data });
  });

  // Handle item pickup events (validation can be added later)
  socket.on('pickup', (data) => {
    io.emit('itemPickedUp', { playerId: socket.id, itemId: data.itemId });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    removePlayer(socket.id);
    io.emit('playerDisconnected', socket.id);
    delete players[socket.id];
  });
});

// Start the server on port 3000 (or process.env.PORT)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
