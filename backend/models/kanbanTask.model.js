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
  }
}, {
  timestamps: true
});

// Index cho kanban_id và status
kanbanTaskSchema.index({ kanban_id: 1, status: 1 });

const KanbanTask = mongoose.model('KanbanTask', kanbanTaskSchema);

module.exports = KanbanTask; 