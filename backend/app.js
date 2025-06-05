// backend/app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Register all models with Mongoose before any routes are defined
require('./models/user.model');
require('./models/project.model');
require('./models/kanban.model');
require('./models/kanbanTask.model');
require('./models/tag.model');
require('./models/counter.model');
require('./models/projectMember.model');
require('./models/team.model');
require('./models/teamMember.model');
require('./models/projectType.model');
require('./models/notification.model');
require('./models/personalMemberList.model');
require('./models/teamActivity.model');
require('./models/userWidget.model');
require('./models/widget.model');

// Feature toggles for safe operation
const { isFeatureEnabled, featureToggleMiddleware, getEnabledFeatures, getDisabledFeatures } = require('./config/featureToggles');

// Only import routes for enabled features
const adminRoutes = require('./routes/admin.routes');
const projectRoutes = require('./routes/project.routes');
const projectMemberRoutes = require('./routes/projectMember.routes');
const teamRoutes = require('./routes/team.routes');
const projectTypeRoutes = require('./routes/projectType.routes'); // Always enable - essential for projects
const { generalRateLimit } = require('./middleware/rateLimiting');

// Conditionally import complex features only if enabled
let widgetRoutes, notificationRoutes, kanbanRoutes, kanbanTaskRoutes, personalMemberListRoutes, teamEnhancedRoutes, userRoleRoutes;

if (isFeatureEnabled('CUSTOM_WIDGETS')) {
  widgetRoutes = require("./routes/widgetRoutes");
}
if (isFeatureEnabled('REAL_TIME_NOTIFICATIONS')) {
  notificationRoutes = require('./routes/notification.routes');
}
if (isFeatureEnabled('ENHANCED_TEAMS')) {
  teamEnhancedRoutes = require('./routes/teamEnhanced.routes');
}
if (isFeatureEnabled('ADVANCED_SEARCH')) {
  kanbanRoutes = require('./routes/kanban.routes');
  kanbanTaskRoutes = require('./routes/kanbanTask.routes');
  personalMemberListRoutes = require('./routes/personalMemberList.routes');
  userRoleRoutes = require('./routes/userRole.routes');
}

// Load biến môi trường từ .env
dotenv.config();

const app = express();

// Cấu hình CORS chi tiết
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Block ALL Socket.IO requests silently BEFORE any logging
app.use((req, res, next) => {
  // Check if this is a Socket.IO request
  if (req.url.startsWith('/socket.io/') && !isFeatureEnabled('SOCKET_IO')) {
    // Silent drop - no logging, no response, just end immediately
    res.statusCode = 404;
    res.end();
    return;
  }
  next();
});

// Custom morgan logging that skips Socket.IO requests (backup safety)
app.use(morgan("dev", {
  skip: function (req, res) { 
    return req.url.startsWith('/socket.io/'); 
  }
}));

// Apply general rate limiting to all requests
app.use(generalRateLimit);

// Middleware para truyền server (io) vào request (được set từ server.js)
// Chỉ áp dụng nếu Socket.IO được bật
if (isFeatureEnabled('SOCKET_IO')) {
  app.use((req, res, next) => {
    req.server = req.app.get('server'); // Lấy server từ app (đã được set trong server.js)
    next();
  });
}



// System status endpoint
app.get('/api/system/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    features: {
      enabled: getEnabledFeatures(),
      disabled: getDisabledFeatures(),
      total: getEnabledFeatures().length + getDisabledFeatures().length
    },
    message: 'UniPlan Backend - Safe Mode with Feature Toggles'
  });
});

// Routes - Only include routes for enabled features
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/password", require("./routes/password.routes"));

// Basic always-enabled routes
app.use('/api/admin', adminRoutes);
app.use('/api', projectRoutes);
app.use('/api', projectMemberRoutes); // Changed from /api/project-members to /api to support /api/projects/:id/members routes
app.use('/api/teams', teamRoutes);
app.use('/api', projectTypeRoutes); // Essential for project creation

// ===== SIMPLE SEARCH (Always enabled - our working APIs) =====
app.use('/api/teams-simple', require('./routes/teamSimpleRoutes')); // Simple team search functionality
app.use('/api/users', require('./routes/user.routes')); // Route cho users

// ===== CONDITIONAL ROUTES (Only if features are enabled) =====
if (isFeatureEnabled('CUSTOM_WIDGETS') && widgetRoutes) {
  app.use("/api/widgets", featureToggleMiddleware('CUSTOM_WIDGETS'), widgetRoutes);
}

if (isFeatureEnabled('REAL_TIME_NOTIFICATIONS') && notificationRoutes) {
  app.use('/api', featureToggleMiddleware('REAL_TIME_NOTIFICATIONS'), notificationRoutes);
}

if (isFeatureEnabled('ENHANCED_TEAMS') && teamEnhancedRoutes) {
  app.use('/api/teams-enhanced', featureToggleMiddleware('ENHANCED_TEAMS'), teamEnhancedRoutes);
}

if (isFeatureEnabled('ADVANCED_SEARCH')) {
  if (kanbanRoutes) app.use('/api/kanban', featureToggleMiddleware('ADVANCED_SEARCH'), kanbanRoutes);
  if (kanbanTaskRoutes) app.use('/api/kanban-tasks', featureToggleMiddleware('ADVANCED_SEARCH'), kanbanTaskRoutes);
  if (personalMemberListRoutes) app.use('/api/personal-members', featureToggleMiddleware('ADVANCED_SEARCH'), personalMemberListRoutes);
  if (userRoleRoutes) app.use('/api/user-roles', featureToggleMiddleware('ADVANCED_SEARCH'), userRoleRoutes);
}

module.exports = app;
