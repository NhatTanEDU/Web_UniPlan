// Test trực tiếp route payment không middleware
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

app.use(express.json());

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Simple payment route without middleware
app.post('/api/payment/test', (req, res) => {
    console.log('🎯 [Direct Payment Test] Route reached!');
    console.log('🎯 [Direct Payment Test] Headers:', req.headers);
    console.log('🎯 [Direct Payment Test] Body:', req.body);
    
    res.json({
        success: true,
        message: 'Payment route reachable',
        body: req.body,
        headers: req.headers.authorization
    });
});

// Test with auth middleware
const authenticateToken = require('./middlewares/auth.middleware');

app.post('/api/payment/test-auth', authenticateToken, (req, res) => {
    console.log('🎯 [Auth Payment Test] Route reached!');
    console.log('🎯 [Auth Payment Test] req.user:', req.user);
    
    res.json({
        success: true,
        message: 'Payment route with auth reachable',
        user: req.user
    });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
});
