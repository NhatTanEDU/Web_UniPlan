const io = require('socket.io-client');

// Configuration
const SOCKET_URL = 'http://localhost:5000';
const TEST_TEAM_ID = '6740a4ebcd74a05dff25a4ac'; // Replace with actual team ID

console.log('🚀 Starting Simple Socket.IO Test');
console.log(`Connecting to: ${SOCKET_URL}`);
console.log(`Test Team ID: ${TEST_TEAM_ID}`);

// Create socket connection
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling']
});

// Socket event handlers
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  
  // Join team room
  socket.emit('join_team', TEST_TEAM_ID);
  console.log(`📍 Joined team room: ${TEST_TEAM_ID}`);
  
  console.log('\n🎧 Listening for events...');
  console.log('ℹ️  Now update a team member role via API or frontend to test');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

// Listen for team member update events
socket.on('team:member_updated', (data) => {
  console.log('\n🔔 RECEIVED EVENT: team:member_updated');
  console.log('📋 Event data:');
  console.log(JSON.stringify(data, null, 2));
  console.log('⏰ Timestamp:', new Date().toISOString());
});

// Listen for any other events
socket.onAny((eventName, ...args) => {
  if (eventName !== 'team:member_updated') {
    console.log(`📡 Other event: ${eventName}`, args);
  }
});

// Connect
socket.connect();

// Keep alive
console.log('\n⏳ Socket listener is running...');
console.log('Press Ctrl+C to exit');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  socket.disconnect();
  process.exit(0);
});
