const mongoose = require('mongoose');

const kanbanSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Archived'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Index cho project_id
kanbanSchema.index({ project_id: 1 });

const Kanban = mongoose.model('Kanban', kanbanSchema);

module.exports = Kanban; 