// Kiểm tra dữ liệu users trong database
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkUserData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/uniplan', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Kiểm tra các user cụ thể từ debug log
    const userIds = [
      '6832fb21218f3827624d77c1', // System Administrator - OK
      '68358b27e31157981e931d89', // Unknown User 1  
      '68358b27e31157981e931d86'  // Unknown User 2
    ];
    
    console.log('\n🔍 Checking user subscription data:');
    for (let userId of userIds) {
      const user = await User.findById(userId);
      console.log(`\nUser ID: ${userId}`);
      if (user) {
        console.log('✅ User found:', {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        });
        
        // 🔍 KIỂM TRA SUBSCRIPTION DATA
        console.log('📦 Subscription data:');
        console.log('  - current_plan_type:', user.current_plan_type);
        console.log('  - trial_start_date:', user.trial_start_date);
        console.log('  - trial_end_date:', user.trial_end_date);
        console.log('  - subscription_start_date:', user.subscription_start_date);
        console.log('  - subscription_end_date:', user.subscription_end_date);
        
        // 🔍 KIỂM TRA METHODS
        if (typeof user.canAccessService === 'function') {
          console.log('  - canAccessService():', user.canAccessService());
        }
        if (typeof user.getPlanDisplayInfo === 'function') {
          console.log('  - getPlanDisplayInfo():', user.getPlanDisplayInfo());
        }
        
        // 🔍 TÍNH TOÁN TRẠNG THÁI
        const isPremium = ['monthly', 'yearly'].includes(user.current_plan_type);
        const isActive = user.canAccessService ? user.canAccessService() : false;
        const subscriptionType = user.current_plan_type || 'free_trial';
        
        console.log('🧮 Calculated status:');
        console.log('  - subscriptionType:', subscriptionType);
        console.log('  - isPremium:', isPremium);
        console.log('  - isActive:', isActive);
        console.log('  - shouldShowUpgrade:', !isPremium || !isActive);
        
      } else {
        console.log('❌ User not found!');
      }
    }
    
    // Thống kê tổng quát
    const totalUsers = await User.countDocuments();
    const usersWithoutName = await User.countDocuments({ 
      $or: [
        { full_name: { $exists: false } },
        { full_name: null },
        { full_name: '' },
        { full_name: { $regex: /^\s*$/ } }
      ]
    });
    
    console.log('\n📊 User Statistics:');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users without proper full_name: ${usersWithoutName}`);
    
    if (usersWithoutName > 0) {
      console.log('\n❌ Users with missing full_name:');
      const badUsers = await User.find({ 
        $or: [
          { full_name: { $exists: false } },
          { full_name: null },
          { full_name: '' },
          { full_name: { $regex: /^\s*$/ } }
        ]
      }).select('_id email full_name');
      badUsers.forEach(user => {
        console.log(`- ID: ${user._id}, Email: ${user.email}, full_name: "${user.full_name}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkUserData();
