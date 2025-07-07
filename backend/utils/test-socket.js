const io = require('socket.io-client');
const axios = require('axios');

// Cấu hình kết nối Socket.IO
const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket'], // Buộc sử dụng WebSocket để tránh xhr poll error
});

// Thay thế userId và token bằng giá trị thực tế của bạn
const USER_ID = '681ba7ecff8ba2947dc8e5b7';
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWJhN2VjZmY4YmEyOTQ3ZGM4ZTViNyIsImVtYWlsIjoidGFubW9pQGV4YW1wbGUyLmNvbSIsImlhdCI6MTc0NjY4NjI5OCwiZXhwIjoxNzQ2Njg5ODk4fQ.nJllzQDBI_g94jbRPYXjuHdyt9KIb6WT_sxXKFbdkqI'; // Cập nhật token mới tại đây

// Hàm tham gia phòng khi kết nối
const joinRoom = () => {
  socket.emit('join', USER_ID, (response) => {
    if (response && response.status === 'success') {
      console.log(`✅ Successfully joined room for user ${USER_ID}`);
    } else {
      console.error('❌ Failed to join room:', response?.message || 'Unknown error');
    }
  });
};

// Hàm tạo thông báo thủ công qua API để test
const createTestNotification = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/notifications',
      {
        project_id: '681bb985f7c830c8adbbcd7c',
        type: 'ProjectUpdated',
      },
      {
        headers: { Authorization: TOKEN },
      }
    );
    console.log('✅ Test notification created:', response.data);
  } catch (error) {
    console.error('❌ Error creating test notification:', {
      message: error.response?.data?.message || error.message,
      details: error.response?.data?.error || error.stack,
    });
  }
};

// Sự kiện khi kết nối
socket.on('connect', () => {
  console.log(`✅ Connected to Socket.IO server with ID: ${socket.id}`);
  joinRoom();
  createTestNotification();
});

// Lắng nghe thông báo mới
socket.on('newNotification', (notification) => {
  console.log('📬 Received new notification:', {
    _id: notification._id,
    user_id: notification.user_id,
    project_id: notification.project_id,
    type: notification.type,
    content: notification.content,
    sent_at: notification.sent_at,
    is_read: notification.is_read,
  });
});

// Xử lý lỗi kết nối
socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

// Ngắt kết nối
socket.on('disconnect', (reason) => {
  console.log(`💨 Disconnected from Socket.IO server. Reason: ${reason}`);
});

// Xử lý khi kết nối lại
socket.on('reconnect', (attemptNumber) => {
  console.log(`🔄 Reconnected after ${attemptNumber} attempt(s)`);
  joinRoom();
});

// Chạy file và giữ kết nối
console.log('🔄 Starting Socket.IO client test...');
process.stdin.resume();

// Thoát khi nhấn Ctrl+C
process.on('SIGINT', () => {
  console.log('🛑 Stopping Socket.IO client test...');
  socket.disconnect();
  process.exit();
});