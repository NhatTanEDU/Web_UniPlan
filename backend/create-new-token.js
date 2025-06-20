// Tạo token mới để test
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('🔄 Tạo token mới...\n');

const payload = {
    id: '676597149394a71590437a74',
    email: 'admin@gmail.com',
    role: 'admin'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

console.log('🆕 Token mới:');
console.log(token);

console.log('\n🔍 Verify token mới:');
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token hợp lệ:');
    console.log('  - User ID:', decoded.id);
    console.log('  - Email:', decoded.email);        
    console.log('  - Role:', decoded.role);
    console.log('  - Issued At:', new Date(decoded.iat * 1000));
    console.log('  - Expires At:', new Date(decoded.exp * 1000));
} catch (error) {
    console.log('❌ Token không hợp lệ:', error.message);
}

// Test token cũ từ frontend
console.log('\n🔍 Test token cũ từ frontend:');
const oldToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjU5NzE0OTM5NGE3MTU5MDQzN2E3NCIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM0NzY1NjU1LCJleHAiOjE3MzQ4NTIwNTV9.f6HFKgYAcyh6IG0FRGZ7OJEgvxGl4SnJhMKv7PGcTAE';

// Decode without verification to see content
try {
    const decodedOld = jwt.decode(oldToken);
    console.log('📋 Nội dung token cũ (không verify):');
    console.log('  - User ID:', decodedOld.id);
    console.log('  - Email:', decodedOld.email);
    console.log('  - Role:', decodedOld.role);
    console.log('  - Issued At:', new Date(decodedOld.iat * 1000));
    console.log('  - Expires At:', new Date(decodedOld.exp * 1000));
    console.log('  - Đã hết hạn?', decodedOld.exp * 1000 < Date.now());
    
    // Try to verify
    const verifiedOld = jwt.verify(oldToken, process.env.JWT_SECRET);
    console.log('✅ Token cũ vẫn hợp lệ');
} catch (error) {
    console.log('❌ Token cũ không hợp lệ:', error.message);
    if (error.name === 'TokenExpiredError') {
        console.log('⏰ Token cũ đã hết hạn');
    }
}
