// backend/test-api-direct.js
// Script test gọi API subscriptionController trực tiếp

const express = require('express');
const mongoose = require('mongoose');
const subscriptionController = require('./controllers/subscriptionController');
require('dotenv').config();

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan');
        console.log('✅ Kết nối MongoDB thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

// Test API call
const testAPI = async (userId) => {
    try {
        console.log(`🔍 Testing API for user: ${userId}`);
        
        // Mock req, res objects
        const req = {
            user: {
                userId: userId
            }
        };
        
        const res = {
            json: (data) => {
                console.log('✅ API Response:');
                console.log(JSON.stringify(data, null, 2));
            },
            status: (code) => ({
                json: (data) => {
                    console.log(`❌ API Error (${code}):`, data);
                }
            })
        };
        
        // Call controller
        await subscriptionController.getSubscriptionStatus(req, res);
        
    } catch (error) {
        console.error('❌ Error testing API:', error);
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();
        
        // Test với user thanhtoan@gmail.com
        const userId = '6855ab6eb60e04f6ea7d875e'; // ID của thanhtoan@gmail.com
        
        await testAPI(userId);
        
        console.log('\n✅ API test completed!');
        
    } catch (error) {
        console.error('❌ Error in main:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
    }
};

// Chạy script
if (require.main === module) {
    main();
}

module.exports = { testAPI };
