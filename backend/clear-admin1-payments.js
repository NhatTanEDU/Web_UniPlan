// Clear pending payments của admin1
const mongoose = require('mongoose');
require('dotenv').config();

async function clearAdmin1Payments() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    const adminUserId = '6832fb21218f3827624d77c1'; // admin1@gmail.com
    
    // Update all pending payments to cancelled
    const paymentsCol = mongoose.connection.db.collection('payments');
    
    const result = await paymentsCol.updateMany(
      {
        user_id: new mongoose.Types.ObjectId(adminUserId),
        payment_status: 'pending'
      },
      {
        $set: {
          payment_status: 'cancelled',
          cancelled_at: new Date()
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} payments to cancelled`);
    
    // List remaining payments
    const remaining = await paymentsCol.find({
      payment_status: 'pending'
    }).toArray();
    
    console.log(`📋 Remaining pending payments: ${remaining.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

clearAdmin1Payments();
