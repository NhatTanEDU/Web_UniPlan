// Reset admin user về trạng thái mới (để test)
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function resetAdminSubscription() {
  try {
    await mongoose.connect('mongodb://localhost:27017/uniplan', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    const adminUser = await User.findById('6832fb21218f3827624d77c1');
    
    if (adminUser) {
      console.log('🔍 Current admin subscription:', {
        current_plan_type: adminUser.current_plan_type,
        trial_start_date: adminUser.trial_start_date,
        trial_end_date: adminUser.trial_end_date,
        subscription_start_date: adminUser.subscription_start_date,
        subscription_end_date: adminUser.subscription_end_date
      });
      
      // Backup current data
      console.log('\n💾 Backing up current subscription data...');
        // Reset về trạng thái user mới (free trial)
      adminUser.current_plan_type = 'free_trial'; // Set về free trial thay vì null
      adminUser.trial_start_date = new Date(); // Bắt đầu trial ngay
      adminUser.trial_end_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày trial
      adminUser.subscription_start_date = null;
      adminUser.subscription_end_date = null;
      
      await adminUser.save();
      
      console.log('✅ Admin subscription reset to new user state');
      console.log('📧 Now login with admin1@gmail.com to test new user experience');
      
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

resetAdminSubscription();
