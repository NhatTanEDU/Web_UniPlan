// Debug token từ frontend để kiểm tra lỗi 401
const jwt = require('jsonwebtoken');
require('dotenv').config();

function debugToken() {
  // Token từ frontend log (user: tannhat180803@gmail.com)
  const frontendToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZjZhNjI0NjM0NmFmYjUxMTNlYjBmMCIsImVtYWlsIjoidGFubmhhdDE4MDgwM0BnbWFpbC5jb20iLCJpYXQiOjE3NTA0Mzk1MzcsImV4cCI6MTc1MDUyNTkzN30.fyJT9L6aLOeBmNFFEjl9FVSs3VW2eLaZ0q_F4SLSefU";
  
  try {
    console.log('🔍 Debugging frontend token...');
    console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    // Decode without verification để xem payload
    const decoded = jwt.decode(frontendToken);
    console.log('📦 Token payload:', decoded);
    
    // Verify với secret
    const verified = jwt.verify(frontendToken, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully:', verified);
    
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
    
    // Kiểm tra user này có tồn tại trong database không
    const mongoose = require('mongoose');
    const User = require('./models/user.model');
    
    mongoose.connect('mongodb://localhost:27017/uniplan')
      .then(async () => {
        console.log('\n🔍 Checking user in database...');
        const user = await User.findById(verified.id);
        
        if (user) {
          console.log('✅ User found in database:');
          console.log('  - Email:', user.email);
          console.log('  - Role:', user.role);
          console.log('  - isActive:', user.isActive);
          console.log('  - current_plan_type:', user.current_plan_type);
        } else {
          console.log('❌ User NOT found in database!');
        }
        
        await mongoose.disconnect();
      })
      .catch(err => {
        console.error('❌ Database error:', err);
      });
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    console.error('❌ Full error:', error);
  }
}

debugToken();
