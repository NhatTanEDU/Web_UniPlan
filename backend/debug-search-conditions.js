const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const TeamMember = require('./models/TeamMember');

async function debugSearchConditions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const team_id = '683a2523ddf616be1a376995';
    const search = 'New Ghost';

    console.log('\n🔍 Debug search conditions for "New Ghost"');
    console.log('='.repeat(50));

    // 1. Check if New Ghost exists in database
    console.log('\n1. Checking if New Ghost exists:');
    const newGhost = await User.findOne({ email: 'newghost@gmail.com' });
    if (newGhost) {
      console.log('✅ New Ghost found in database:');
      console.log(`   ID: ${newGhost._id}`);
      console.log(`   Name: ${newGhost.name}`);
      console.log(`   Full Name: ${newGhost.full_name}`);
      console.log(`   Email: ${newGhost.email}`);
      console.log(`   is_active: ${newGhost.is_active}`);
      console.log(`   isActive: ${newGhost.isActive}`);
    } else {
      console.log('❌ New Ghost NOT found in database');
      return;
    }

    // 2. Check existing team members
    console.log('\n2. Checking existing team members:');
    const existingMembers = await TeamMember.find({ 
      team_id, 
      is_active: true 
    }).select('user_id');
    const excludeUserIds = existingMembers.map(m => m.user_id);
    console.log(`   Team has ${existingMembers.length} existing members`);
    console.log(`   Exclude IDs: ${excludeUserIds.map(id => id.toString())}`);
    
    const isNewGhostInTeam = excludeUserIds.some(id => id.toString() === newGhost._id.toString());
    console.log(`   Is New Ghost already in team? ${isNewGhostInTeam ? 'YES' : 'NO'}`);

    // 3. Test each search condition separately
    console.log('\n3. Testing search conditions separately:');
    
    // Test base condition (not in team)
    const baseCondition = { _id: { $nin: excludeUserIds } };
    const usersNotInTeam = await User.find(baseCondition);
    console.log(`   Users not in team: ${usersNotInTeam.length}`);
    const newGhostNotInTeam = usersNotInTeam.some(u => u._id.toString() === newGhost._id.toString());
    console.log(`   Is New Ghost not in team? ${newGhostNotInTeam ? 'YES' : 'NO'}`);

    // Test active condition
    const activeCondition = { $or: [ { is_active: true }, { isActive: true } ] };
    const activeUsers = await User.find(activeCondition);
    console.log(`   Active users: ${activeUsers.length}`);
    const newGhostActive = activeUsers.some(u => u._id.toString() === newGhost._id.toString());
    console.log(`   Is New Ghost active? ${newGhostActive ? 'YES' : 'NO'}`);

    // Test search condition
    const searchCondition = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };
    const searchUsers = await User.find(searchCondition);
    console.log(`   Users matching search "${search}": ${searchUsers.length}`);
    const newGhostInSearch = searchUsers.some(u => u._id.toString() === newGhost._id.toString());
    console.log(`   Is New Ghost in search results? ${newGhostInSearch ? 'YES' : 'NO'}`);

    if (newGhostInSearch) {
      const matchingUser = searchUsers.find(u => u._id.toString() === newGhost._id.toString());
      console.log(`   Matching fields for New Ghost:`);
      console.log(`     name: "${matchingUser.name}" (matches: ${matchingUser.name && matchingUser.name.toLowerCase().includes(search.toLowerCase())})`);
      console.log(`     full_name: "${matchingUser.full_name}" (matches: ${matchingUser.full_name && matchingUser.full_name.toLowerCase().includes(search.toLowerCase())})`);
      console.log(`     email: "${matchingUser.email}" (matches: ${matchingUser.email && matchingUser.email.toLowerCase().includes(search.toLowerCase())})`);
    }

    // 4. Test combined conditions exactly as in controller
    console.log('\n4. Testing combined conditions (as in controller):');
    const conditions = { _id: { $nin: excludeUserIds } };
    const activeFilter = { $or: [ { is_active: true }, { isActive: true } ] };
    conditions.$and = [ activeFilter ];

    if (search) {
      conditions.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { full_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
    }

    console.log(`   Final conditions:`, JSON.stringify(conditions, null, 2));
    
    const finalUsers = await User.find(conditions);
    console.log(`   Final search results: ${finalUsers.length} users`);
    
    const newGhostInFinal = finalUsers.some(u => u._id.toString() === newGhost._id.toString());
    console.log(`   Is New Ghost in final results? ${newGhostInFinal ? 'YES' : 'NO'}`);

    if (finalUsers.length > 0) {
      console.log('\n   Final users found:');
      finalUsers.forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.full_name || user.name} (${user.email})`);
      });
    }

    // 5. Test alternative search terms
    console.log('\n5. Testing alternative search terms:');
    const searchTerms = ['New', 'Ghost', 'newghost', 'newghost@gmail.com'];
    
    for (const term of searchTerms) {
      const altConditions = { _id: { $nin: excludeUserIds } };
      altConditions.$and = [ activeFilter ];
      altConditions.$and.push({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { full_name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } }
        ]
      });

      const altUsers = await User.find(altConditions);
      console.log(`   Search "${term}": ${altUsers.length} results`);
      const newGhostFound = altUsers.some(u => u._id.toString() === newGhost._id.toString());
      if (newGhostFound) {
        console.log(`     ✅ New Ghost found with search term "${term}"`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📦 Disconnected from MongoDB');
  }
}

debugSearchConditions();
