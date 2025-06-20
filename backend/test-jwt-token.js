// Test JWT decoding với token thật từ frontend
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test JWT decoding với token thật từ frontend
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjU5NzE0OTM5NGE3MTU5MDQzN2E3NCIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM0NzY1NjU1LCJleHAiOjE3MzQ4NTIwNTV9.f6HFKgYAcyh6IG0FRGZ7OJEgvxGl4SnJhMKv7PGcTAE';

console.log('🔍 Testing JWT Token...\n');

try {
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('✅ Token hợp lệ:');
    console.log('  - User ID:', decoded.id);
    console.log('  - Email:', decoded.email);        
    console.log('  - Role:', decoded.role);
    console.log('  - Issued At:', new Date(decoded.iat * 1000));
    console.log('  - Expires At:', new Date(decoded.exp * 1000));
    console.log('  - Còn lại:', Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60), 'phút');
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
        console.log('⚠️  Token đã hết hạn!');
    } else {
        console.log('✅ Token còn hiệu lực');
    }
    
} catch (error) {
    console.log('❌ Token không hợp lệ:', error.message);
    
    if (error.name === 'TokenExpiredError') {
        console.log('⏰ Token đã hết hạn');
    } else if (error.name === 'JsonWebTokenError') {
        console.log('🔐 Token không đúng định dạng hoặc secret key sai');
    }
}

console.log('\n🔑 JWT_SECRET được sử dụng:', process.env.JWT_SECRET);
