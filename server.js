const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static('public'));

// When a client connects
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Generate a random spawn position
    const spawnPosition = {
        x: Math.random() * 100 - 50,  // Range: -50 to 50
        y: 0,
        z: Math.random() * 100 - 50
    };

    // Send the spawn position to the client
    socket.emit('spawn', spawnPosition);

    // Log when a client disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
