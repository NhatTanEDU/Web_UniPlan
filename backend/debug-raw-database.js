// Kiểm tra database collections và raw data
const mongoose = require('mongoose');
require('dotenv').config();

async function checkRawDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Database collections:');
    for (const col of collections) {
      console.log(`  - ${col.name}`);
    }
    
    // Check payments collection directly
    const paymentsCol = mongoose.connection.db.collection('payments');
    const paymentCount = await paymentsCol.countDocuments();
    console.log(`\n💳 Payments collection total count: ${paymentCount}`);
    
    if (paymentCount > 0) {
      console.log('\n📄 All payments in database:');
      const allPayments = await paymentsCol.find({}).toArray();
        for (const payment of allPayments) {
        console.log('\n💳 Payment:');
        console.log(`  - _id: ${payment._id}`);
        console.log(`  - user_id: ${payment.user_id}`);
        console.log(`  - momo_order_id: ${payment.momo_order_id}`);
        console.log(`  - payment_status: ${payment.payment_status}`);
        console.log(`  - expired_at: ${payment.expired_at}`);
        console.log(`  - created_at: ${payment.created_at}`);
      }
      
      // Check specific user payments
      const userId = '6855a3a7736a993ccfbfa9d1';
      console.log(`\n🔍 Payments for user ${userId}:`);
      
      const userPayments = await paymentsCol.find({ 
        user_id: new mongoose.Types.ObjectId(userId) 
      }).toArray();
      
      console.log(`Found ${userPayments.length} payments for this user`);
      
      const pendingPayments = await paymentsCol.find({
        user_id: new mongoose.Types.ObjectId(userId),
        payment_status: 'pending',
        expired_at: { $gt: new Date() }
      }).toArray();
      
      console.log(`Found ${pendingPayments.length} pending payments for this user`);
      
      for (const payment of userPayments) {
        const isExpired = payment.expired_at < new Date();
        console.log(`  - ${payment.momo_order_id} | ${payment.payment_status} | expires: ${payment.expired_at} | expired: ${isExpired}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkRawDatabase();
