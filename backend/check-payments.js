// Kiểm tra trực tiếp payments trong database
const mongoose = require('mongoose');
const Payment = require('./models/payment.model');
const User = require('./models/user.model');
require('dotenv').config();

async function checkPaymentsInDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find user
    const user = await User.findOne({ email: 'tandeptrai1@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.full_name, user._id);
    console.log('⏰ Current time:', new Date());
    
    // Find all payments for this user
    const allPayments = await Payment.find({ user_id: user._id })
      .sort({ created_at: -1 });
    
    console.log(`\n📋 Found ${allPayments.length} total payments:`);
    
    for (const payment of allPayments) {
      const isExpired = payment.expired_at < new Date();
      const isPending = payment.payment_status === 'pending';
        console.log('\n💳 Payment:');
      console.log(`  - Order ID: ${payment.momo_order_id}`);
      console.log(`  - Status: ${payment.payment_status}`);
      console.log(`  - Amount: ${payment.amount}`);
      console.log(`  - Plan: ${payment.plan_name}`);
      console.log(`  - Created: ${payment.created_at}`);
      console.log(`  - Expires: ${payment.expired_at}`);
      console.log(`  - Is Expired: ${isExpired}`);
      console.log(`  - Is Pending: ${isPending}`);
      console.log(`  - Blocks new payment: ${isPending && !isExpired}`);
    }
    
    // Find specifically the blocking payment
    const blockingPayment = await Payment.findOne({
      user_id: user._id,
      payment_status: 'pending',
      expired_at: { $gt: new Date() }
    });
    
    console.log('\n🚫 Blocking payment (pending & not expired):');
    if (blockingPayment) {
      console.log(`  - Order ID: ${blockingPayment.momo_order_id}`);
      console.log(`  - Expires: ${blockingPayment.expired_at}`);
      console.log('  - This payment blocks new payments!');
      
      // Update this payment to cancelled
      console.log('\n🗑️  Cancelling blocking payment...');
      blockingPayment.payment_status = 'cancelled';
      blockingPayment.cancelled_at = new Date();
      await blockingPayment.save();
      console.log('✅ Payment cancelled');
    } else {
      console.log('  - No blocking payment found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkPaymentsInDB();
