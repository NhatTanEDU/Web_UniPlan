// Test script to verify Socket.IO middleware is working
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set io in app (same as in server.js)
app.set('socketio', io);

// Middleware to inject io into request (same as in app.js)
app.use((req, res, next) => {
  req.io = req.app.get('socketio');
  console.log('Socket.IO middleware - req.io exists:', !!req.io);
  next();
});

// Test endpoint
app.get('/test-socket', (req, res) => {
  console.log('Test endpoint - req.io exists:', !!req.io);
  console.log('Test endpoint - req.io type:', typeof req.io);
  
  if (req.io) {
    console.log('Emitting test event...');
    req.io.emit('test:message', { message: 'Socket.IO is working!' });
    res.json({ success: true, message: 'Socket.IO event emitted' });
  } else {
    res.json({ success: false, message: 'req.io is undefined' });
  }
});

server.listen(3001, () => {
  console.log('Test server running on port 3001');
  console.log('Visit http://localhost:3001/test-socket to test');
});
