// models/document.model.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // Tên file gốc
    fileType: { type: String },                 // 'image/png', 'application/pdf',...
    fileSize: { type: Number },                 // Kích thước file (bytes)

  // Lưu file data trực tiếp vào MongoDB
  fileData: { type: Buffer, required: true }, // Binary data của file

  // Liên kết theo ngữ cảnh
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanTask', index: true },

    // Người tải lên
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
