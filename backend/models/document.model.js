// models/document.model.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileName: { type: String, required: true }, // Tên file gốc
    fileUrl: { type: String, required: true },  // URL công khai trên Supabase
    fileType: { type: String },                 // 'image/png', 'application/pdf',...
    fileSize: { type: Number },                 // Kích thước file (bytes)
    storagePath: { type: String, required: true }, // Đường dẫn trên Supabase Storage để sau này có thể xóa

    // Liên kết theo ngữ cảnh (sẽ được dùng ở các giai đoạn sau)
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanTask', index: true },

    // Người tải lên
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
