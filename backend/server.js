require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

// Feature toggles for safe operation
const { isFeatureEnabled, getEnabledFeatures, getDisabledFeatures } = require('./config/featureToggles');

// Only import complex features if enabled
let socketIo, deleteOldProjects, UserWidget;

if (isFeatureEnabled('SOCKET_IO')) {
  socketIo = require('socket.io');
}

// Only import cleanup if advanced features are enabled
if (isFeatureEnabled('ADVANCED_SEARCH')) {
  deleteOldProjects = require('./utils/cleaner');
}

if (isFeatureEnabled('CUSTOM_WIDGETS')) {
  UserWidget = require('./models/userWidget.model.js');
}

const server = http.createServer(app);

// Only set up Socket.IO if the feature is enabled
let io = null;
if (isFeatureEnabled('SOCKET_IO') && socketIo) {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // Lưu instance io và server vào app để sử dụng ở các file khác
  app.set('server', server);
  server.io = io;
} else {
  console.log('⚠️  Socket.IO is disabled - Real-time features unavailable');
}

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Only run periodic cleanup if advanced features are enabled
if (isFeatureEnabled('ADVANCED_SEARCH') && deleteOldProjects) {
  setInterval(deleteOldProjects, 24 * 60 * 60 * 1000);
  console.log('✅ Periodic cleanup enabled');
} else {
  console.log('⚠️  Periodic cleanup disabled');
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('MongoDB Connection Name:', mongoose.connection.name);
    
    // Display feature status on startup
    console.log('\n📊 FEATURE STATUS:');
    console.log(`   ✅ Enabled: ${getEnabledFeatures().length} features`);
    console.log(`   ❌ Disabled: ${getDisabledFeatures().length} features`);
    
    if (isFeatureEnabled('SIMPLE_SEARCH')) {
      console.log('   🔍 Simple Search APIs: ENABLED');
    }
    if (!isFeatureEnabled('ENHANCED_TEAMS')) {
      console.log('   ⚠️  Enhanced Teams: DISABLED (Safe Mode)');
    }
    if (!isFeatureEnabled('SOCKET_IO')) {
      console.log('   ⚠️  Socket.IO: DISABLED (Safe Mode)');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT} (Safe Mode)`);
      console.log(`📋 System Status: http://localhost:${PORT}/api/system/status`);
      console.log(`🔍 Simple Search: http://localhost:${PORT}/api/teams-simple/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Socket.IO logic - Only if enabled
if (isFeatureEnabled('SOCKET_IO') && io && isFeatureEnabled('CUSTOM_WIDGETS') && UserWidget) {
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
} else {
  console.log('⚠️  Socket.IO features disabled - Running in safe mode without real-time updates');
}

module.exports = server;