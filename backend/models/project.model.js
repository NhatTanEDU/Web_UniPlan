const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    project_name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled', 'Archived'],
        default: 'Planning'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    project_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectType',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    deleted_at: {
        type: Date,
        default: null
    },
    team_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null // Dự án có thể không thuộc nhóm nào
    }
}, {
    timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

// Virtual để populate team info
projectSchema.virtual('team', {
    ref: 'Team',
    localField: 'team_id',
    foreignField: '_id',
    justOne: true
});

module.exports = Project;