// Kiểm tra và xóa payment pending cho user
const mongoose = require('mongoose');
const Payment = require('./models/payment.model');
const User = require('./models/user.model');
require('dotenv').config();

async function checkAndClearPendingPayments() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find user by email
    const user = await User.findOne({ email: 'tandeptrai1@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.full_name, user._id);
      // Check pending payments (including expired ones)
    const pendingPayments = await Payment.find({
      user_id: user._id,
      payment_status: 'pending'
      // Remove expiry check to see all pending payments
    });
    
    console.log(`\n🔍 Found ${pendingPayments.length} pending payments:`);
    
    for (const payment of pendingPayments) {
      console.log(`  - Order ID: ${payment.momo_order_id}`);
      console.log(`  - Amount: ${payment.amount}`);
      console.log(`  - Plan: ${payment.plan_name}`);
      console.log(`  - Created: ${payment.created_at}`);
      console.log(`  - Expires: ${payment.expired_at}`);
      console.log('');
    }
    
    if (pendingPayments.length > 0) {
      console.log('🗑️  Clearing pending payments...');
        // Delete or update pending payments (including expired ones)
      const result = await Payment.updateMany(
        {
          user_id: user._id,
          payment_status: 'pending'
          // Remove expiry check to clear all pending
        },
        {
          payment_status: 'cancelled',
          cancelled_at: new Date()
        }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} payments to cancelled`);
    } else {
      console.log('✅ No pending payments found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkAndClearPendingPayments();
