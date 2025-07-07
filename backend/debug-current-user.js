// Kiểm tra user nào đang được sử dụng với token hiện tại
const jwt = require('jsonwebtoken');
require('dotenv').config();

function decodeToken() {
  // Lấy token từ log frontend
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzJmYjIxMjE4ZjM4Mjc2MjRkNzdjMSIsImVtYWlsIjoiYWRtaW4xQGdtYWlsLmNvbSIsImlhdCI6MTc1MDQzNzc3MSwiZXhwIjoxNzUwNTI0MTcxfQ.CKIHLUhHB9IN6gxLPh2OzcvKVRdYYl5BtInNJwtafn0";
  
  try {
    console.log('🔍 Decoding current token...');
    
    // Decode without verification để xem payload
    const decoded = jwt.decode(token);
    console.log('📦 Token payload:', decoded);
    
    // Verify với secret
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified:', verified);
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = verified.exp < now;
    
    console.log('⏰ Token status:');
    console.log('  - Issued at:', new Date(verified.iat * 1000));
    console.log('  - Expires at:', new Date(verified.exp * 1000));
    console.log('  - Current time:', new Date(now * 1000));
    console.log('  - Is expired:', isExpired);
    console.log('  - Time remaining:', verified.exp - now, 'seconds');
    
    console.log('\n👤 User info from token:');
    console.log('  - User ID:', verified.id);
    console.log('  - Email:', verified.email);
    
  } catch (error) {
    console.error('❌ Token decode error:', error.message);
  }
}

decodeToken();
