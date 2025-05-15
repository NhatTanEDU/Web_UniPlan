// backend/models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/ // Basic email validation
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 6 
    },
    
    // === CÁC TRƯỜNG MỚI THÊM VÀO ===
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    current_plan_type: {
        type: String,
        enum: ['Free', 'Basic', 'Premium'],
        default: 'Free'
    },
    online_status: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Offline'
    },
    avatar_url: {
        type: String,
        default: null // hoặc có thể bỏ "default" nếu không muốn giá trị mặc định
    },
    isActive: {
        type: Boolean,
        default: true
    }
    
}, { timestamps: true }); // timestamps tự động tạo created_at và updated_at

// Hash the password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

// Method kiểm tra password
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;