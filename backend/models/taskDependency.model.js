const mongoose = require('mongoose');

const taskDependencySchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  source_task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KanbanTask',
    required: true
  },
  target_task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KanbanTask',
    required: true
  },
  dependency_type: {
    type: String,
    enum: ['finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish'],
    default: 'finish-to-start'
  },
  lag_days: {
    type: Number,
    default: 0 // Số ngày trễ (có thể âm cho lead time)
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes để tối ưu truy vấn
taskDependencySchema.index({ project_id: 1, is_active: 1 });
taskDependencySchema.index({ source_task_id: 1, target_task_id: 1 });

// Prevent circular dependencies
taskDependencySchema.pre('save', function(next) {
  if (this.source_task_id.toString() === this.target_task_id.toString()) {
    const error = new Error('Task không thể phụ thuộc vào chính nó');
    error.code = 'CIRCULAR_DEPENDENCY';
    return next(error);
  }
  next();
});

const TaskDependency = mongoose.model('TaskDependency', taskDependencySchema);

module.exports = TaskDependency;
