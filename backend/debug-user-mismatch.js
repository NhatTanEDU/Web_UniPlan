// So sánh user ID từ token vs database
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Payment = require('./models/payment.model');
require('dotenv').config();

async function compareUserIds() {
  try {
    // Decode token để lấy user ID
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NTVhM2E3NzM2YTk5M2NjZmJmYTlkMSIsImVtYWlsIjoidGFuZGVwdHJhaTFAZ21haWwuY29tIiwiaWF0IjoxNzUwNDQyOTMyLCJleHAiOjE3NTA1MjkzMzJ9.9UR9xAQyjUNS6YpyGBV7m_FqmAu2KMptNII4IJVGMpc';
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Token user ID:', decoded.id);
    console.log('📧 Token email:', decoded.email);
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find user by email from token
    const userByEmail = await User.findOne({ email: decoded.email });
    console.log('👤 User from email:', userByEmail ? userByEmail._id : 'NOT FOUND');
    
    // Find user by ID from token
    const userById = await User.findById(decoded.id);
    console.log('👤 User from ID:', userById ? userById._id : 'NOT FOUND');
    
    if (userByEmail) {
      console.log('\n📧 User found by email:');
      console.log('  - ID:', userByEmail._id);
      console.log('  - Name:', userByEmail.full_name);
      console.log('  - Email:', userByEmail.email);
      
      // Check payments for this user
      console.log('\n🔍 Checking payments for user ID:', userByEmail._id);
      
      const allPayments = await Payment.find({ user_id: userByEmail._id });
      console.log(`📋 Total payments: ${allPayments.length}`);
      
      for (const payment of allPayments) {
        console.log(`  - ${payment.momo_order_id} | ${payment.payment_status} | ${payment.expired_at}`);
      }
      
      // Check pending payments specifically
      const pendingPayments = await Payment.find({
        user_id: userByEmail._id,
        payment_status: 'pending',
        expired_at: { $gt: new Date() }
      });
      
      console.log(`\n🚫 Blocking payments: ${pendingPayments.length}`);
      for (const payment of pendingPayments) {
        console.log(`  - ${payment.momo_order_id} expires: ${payment.expired_at}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

compareUserIds();
