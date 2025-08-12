const mongoose = require('mongoose');
require('dotenv').config();

// Payment schema
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  payment_status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending' 
  },
  momoTransId: { type: String },
  payUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

async function clearPendingPaymentsForTannhat() {
  try {
    console.log('✅ Connected to MongoDB');
    
    const targetEmail = 'tannhat180803@gmail.com';
    console.log(`🔍 Finding user with email: ${targetEmail}`);
    
    // Find user by email
    const User = mongoose.model('User');
    const user = await User.findOne({ email: targetEmail });
    
    if (!user) {
      console.log(`❌ User not found with email: ${targetEmail}`);
      return;
    }
    
    console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user._id})`);
    
    // Find pending/processing payments
    const pendingPayments = await Payment.find({
      userId: user._id,
      payment_status: { $in: ['pending', 'processing'] }
    });
    
    console.log(`🔍 Found ${pendingPayments.length} pending/processing payments:`);
    
    if (pendingPayments.length > 0) {
      pendingPayments.forEach(payment => {
        console.log(`  - Order ID: ${payment.orderId}`);
        console.log(`    Status: ${payment.payment_status}`);
        console.log(`    Amount: ${payment.amount} VND`);
        console.log(`    Created: ${payment.createdAt}`);
        console.log(`    Expires: ${payment.expiresAt}`);
        console.log(`    ---`);
      });
      
      // Delete pending/processing payments
      const result = await Payment.deleteMany({
        userId: user._id,
        payment_status: { $in: ['pending', 'processing'] }
      });
      
      console.log(`✅ Deleted ${result.deletedCount} pending/processing payments`);
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

// Connect to MongoDB and run
mongoose.connect(process.env.MONGODB_URI)
  .then(() => clearPendingPaymentsForTannhat())
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
