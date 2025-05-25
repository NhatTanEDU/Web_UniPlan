// backend/app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const widgetRoutes = require("./routes/widgetRoutes");
const adminRoutes = require('./routes/admin.routes');
const projectRoutes = require('./routes/project.routes');
const projectMemberRoutes = require('./routes/projectMember.routes');
const notificationRoutes = require('./routes/notification.routes');
const projectTypeRoutes = require('./routes/projectType.routes');
const kanbanRoutes = require('./routes/kanban.routes');
const kanbanTaskRoutes = require('./routes/kanbanTask.routes');
const personalMemberListRoutes = require('./routes/personalMemberList.routes');

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
app.use(morgan("dev"));

// Middleware để truyền server (io) vào request (được set từ server.js)
// Đặt trước các route để tất cả route đều truy cập được req.server
app.use((req, res, next) => {
  req.server = req.app.get('server'); // Lấy server từ app (đã được set trong server.js)
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/password", require("./routes/password.routes"));
app.use("/api/widgets", widgetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', projectRoutes);
app.use('/api/project-members', projectMemberRoutes);
app.use('/api', notificationRoutes);
app.use('/api', projectTypeRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/kanban-tasks', kanbanTaskRoutes);
app.use('/api/personal-members', personalMemberListRoutes);

module.exports = app;
