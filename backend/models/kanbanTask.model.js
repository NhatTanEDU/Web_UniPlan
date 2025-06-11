const mongoose = require('mongoose');

const kanbanTaskSchema = new mongoose.Schema({
  kanban_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kanban',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Cần làm', 'Đang làm', 'Hoàn thành'],
    default: 'Cần làm'
  },
  order: {
    type: Number,
    required: true
  },
  start_date: {
    type: Date
  },
  due_date: {
    type: Date
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  priority: {
    type: String,
    enum: ['Thấp', 'Trung bình', 'Cao'],
    default: 'Trung bình'
  },
  color: { // Màu sắc của task card
    type: String,
    default: '#ffffff' // Mặc định màu trắng
  },
  is_pinned: { // Task có được ghim lên đầu cột không
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index để tối ưu truy vấn thường dùng
kanbanTaskSchema.index({ kanban_id: 1, status: 1, order: 1 });
kanbanTaskSchema.index({ kanban_id: 1, is_pinned: -1, order: 1 }); // Cho việc sort ghim

const KanbanTask = mongoose.model('KanbanTask', kanbanTaskSchema);

module.exports = KanbanTask; 