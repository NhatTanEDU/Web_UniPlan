const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@test.com'; // Replace with actual admin email
const ADMIN_PASSWORD = 'admin123'; // Replace with actual admin password

// Test data - you'll need to replace these with actual IDs from your database
const TEST_DATA = {
  teamId: '6740a4ebcd74a05dff25a4ac', // Replace with actual team ID
  memberId: '6740a4f2cd74a05dff25a4b0' // Replace with actual member ID
};

async function triggerRoleUpdate() {
  console.log('🚀 Starting Role Update Trigger Test');
  
  try {
    // Step 1: Login
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get current member info
    console.log('\n🔍 Getting current member info...');
    const memberResponse = await axios.get(
      `${BASE_URL}/api/teams/${TEST_DATA.teamId}/members`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!memberResponse.data.success) {
      console.error('❌ Failed to get members:', memberResponse.data);
      return;
    }

    const member = memberResponse.data.members.find(m => m._id === TEST_DATA.memberId);
    if (!member) {
      console.error('❌ Member not found');
      return;
    }

    console.log(`✅ Current member: ${member.user_id?.full_name || 'Unknown'}`);
    console.log(`   Current role: ${member.role}`);

    // Step 3: Determine new role
    const currentRole = member.role;
    let newRole;
    
    if (currentRole === 'Member') {
      newRole = 'Editor';
    } else if (currentRole === 'Editor') {
      newRole = 'Member';
    } else {
      newRole = 'Editor'; // Default fallback
    }

    console.log(`🔄 Will update role from "${currentRole}" to "${newRole}"`);

    // Step 4: Update role
    console.log('\n📡 Sending role update request...');
    const updateResponse = await axios.put(
      `${BASE_URL}/api/teams/${TEST_DATA.teamId}/members/${TEST_DATA.memberId}/role`,
      { role: newRole },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (updateResponse.data.success) {
      console.log('✅ Role update successful!');
      console.log('📋 Updated member data:');
      console.log(JSON.stringify(updateResponse.data.member, null, 2));
      console.log('\n🔔 If Socket.IO is working, connected clients should receive a "team:member_updated" event now!');
    } else {
      console.error('❌ Role update failed:', updateResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Add delay option
const delay = process.argv[2] ? parseInt(process.argv[2]) * 1000 : 0;

if (delay > 0) {
  console.log(`⏳ Waiting ${delay/1000} seconds before triggering update...`);
  setTimeout(triggerRoleUpdate, delay);
} else {
  triggerRoleUpdate();
}
