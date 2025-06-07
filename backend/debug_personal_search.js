// Debug Personal Member Search
const mongoose = require('mongoose');
const User = require('./models/user.model');
const PersonalMemberList = require('./models/personalMemberList.model');

async function debugPersonalSearch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan_db');
    console.log('🔗 Connected to MongoDB');
    
    // Check total users
    const totalUsers = await User.countDocuments();
    console.log('📊 Total users in database:', totalUsers);
    
    // Check active users
    const activeUsers = await User.countDocuments({ isActive: true });
    console.log('✅ Active users (isActive: true):', activeUsers);
    
    // Check users with different field names
    const usersWithIsActive = await User.countDocuments({ isActive: { $exists: true } });
    console.log('📋 Users with isActive field:', usersWithIsActive);
    
    // Check first few users and their isActive status
    const sampleUsers = await User.find().limit(5).select('name email isActive');
    console.log('📝 Sample users:');
    sampleUsers.forEach(user => {
      console.log('  ', user.name, user.email, 'isActive:', user.isActive);
    });
    
    // Test the exact query from personalMemberList.controller.js
    console.log('\n🔍 Testing search query...');
    const searchRegex = new RegExp('admin', 'i');
    
    // Simulate the exact query from the controller
    const existingMemberIds = []; // Empty for this test
    
    const searchResults = await User.find({
      _id: { $nin: existingMemberIds },
      isActive: true,
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    })
    .select('name email avatar_url online_status role')
    .limit(10)
    .sort({ name: 1 });
    
    console.log('🎯 Search results for "admin":', searchResults.length);
    searchResults.forEach(user => {
      console.log('  Found:', user.name, user.email);
    });
    
    // Try different search terms
    const testTerms = ['user', 'test', 'admin', '@'];
    for (const term of testTerms) {
      const regex = new RegExp(term, 'i');
      const count = await User.countDocuments({
        isActive: true,
        $or: [
          { name: regex },
          { email: regex }
        ]
      });
      console.log(`🔎 Search "${term}": ${count} results`);
    }
    
    // Check if users have the name and email fields
    const usersWithName = await User.countDocuments({ name: { $exists: true, $ne: null } });
    const usersWithEmail = await User.countDocuments({ email: { $exists: true, $ne: null } });
    console.log('📧 Users with name field:', usersWithName);
    console.log('📧 Users with email field:', usersWithEmail);
    
    // Show actual field names in the first user
    const firstUser = await User.findOne();
    if (firstUser) {
      console.log('🗂️ Fields in first user:', Object.keys(firstUser.toObject()));
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugPersonalSearch();
