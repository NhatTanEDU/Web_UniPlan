// server.js
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // Import app từ app.js
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Khởi tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://web-production-435e4.up.railway.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Quản lý kết nối Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  // Kanban room management
  socket.on('join-kanban-room', (kanbanId) => {
    socket.join(kanbanId);
    console.log(`User ${socket.id} joined kanban room ${kanbanId}`);
  });

  socket.on('leave-kanban-room', (kanbanId) => {
    socket.leave(kanbanId);
    console.log(`User ${socket.id} left kanban room ${kanbanId}`);
  });

  // Team room management for real-time team member updates
  socket.on('join_team', (teamId) => {
    socket.join(teamId);
    console.log(`User ${socket.id} joined team room ${teamId}`);
  });

  socket.on('leave_team', (teamId) => {
    socket.leave(teamId);
    console.log(`User ${socket.id} left team room ${teamId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Gán io vào app để các controller có thể sử dụng
app.set('socketio', io);

// Hàm chính để khởi động toàn bộ ứng dụng
const startServer = async () => {
  try {
    // 1. Cố gắng kết nối đến Database
    await connectDB();

    // 2. NẾU KẾT NỐI THÀNH CÔNG, mới bắt đầu lắng nghe request
    server.listen(PORT, () => {
      console.log('----------------------------------------------------');
      console.log('✅✅✅ DATABASE CONNECTED - SERVER IS READY ✅✅✅');
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log('----------------------------------------------------');
    });

  } catch (error) {
    // 3. NẾU KẾT NỐI THẤT BẠI, log lỗi và dừng hoàn toàn ứng dụng
    console.error('❌❌❌ FAILED TO CONNECT TO DATABASE. SERVER WILL NOT START. ❌❌❌');
    console.error(error.message);
    process.exit(1); // Thoát ứng dụng với mã lỗi
  }
};

// Gọi hàm để bắt đầu
startServer();

// Bắt lỗi toàn cục để server không bị sập bất ngờ
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1); // Để nodemon tự động restart lại server
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1); // Để nodemon tự động restart lại server
});

module.exports = server;