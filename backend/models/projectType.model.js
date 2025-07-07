const mongoose = require('mongoose');

const projectTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Tạo compound unique index cho name + userId thay vì chỉ name
projectTypeSchema.index({ name: 1, userId: 1 }, { unique: true });

const ProjectType = mongoose.model('ProjectType', projectTypeSchema);

module.exports = ProjectType; 