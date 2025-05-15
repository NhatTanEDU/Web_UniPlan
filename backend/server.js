require('dotenv').config();

const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const app = require('./app');
const deleteOldProjects = require('./utils/cleaner');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Lưu instance io và server vào app để sử dụng ở các file khác
app.set('server', server); // Lưu server vào app
server.io = io;

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

setInterval(deleteOldProjects, 24 * 60 * 60 * 1000);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('MongoDB Connection Name:', mongoose.connection.name);

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Socket.IO logic
const UserWidget = require('./models/userWidget.model.js');

io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  // Logic cho thông báo: Client tham gia phòng dựa trên userId
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    } else {
      console.log('❌ No userId provided for join event');
    }
  });

  // Logic hiện có: Cập nhật vị trí widget
  socket.on('widget:position-update', async ({ id, updates }) => {
    try {
      await UserWidget.findByIdAndUpdate(id, updates);
      socket.broadcast.emit('widget:position-update', { id, updates });
    } catch (error) {
      console.error('❌ Error updating widget position:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('💨 Client disconnected:', socket.id);
  });
});

module.exports = server;