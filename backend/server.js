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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Quản lý kết nối Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  socket.on('join-kanban-room', (kanbanId) => {
    socket.join(kanbanId);
    console.log(`User ${socket.id} joined room ${kanbanId}`);
  });

  socket.on('leave-kanban-room', (kanbanId) => {
    socket.leave(kanbanId);
    console.log(`User ${socket.id} left room ${kanbanId}`);
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

module.exports = server;