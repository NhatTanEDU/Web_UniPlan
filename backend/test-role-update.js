// Test role update functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'admin1@gmail.com';
const PASSWORD = '123456';
const TEAM_ID = '683f3c43403cc6904ca1a395';

async function loginAndGetToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const data = await res.json();
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
  return data.token;
}

async function getTeamMembers(token) {
  const res = await fetch(`${BASE_URL}/teams/${TEAM_ID}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.members || [];
}

async function updateMemberRole(token, memberId, role) {
  console.log(`Updating member ${memberId} to role: ${role}`);
  console.log(`URL: ${BASE_URL}/teams/${TEAM_ID}/members/${memberId}`);
  
  const res = await fetch(`${BASE_URL}/teams/${TEAM_ID}/members/${memberId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  
  console.log('Response status:', res.status);
  const data = await res.text();
  console.log('Response body:', data);
  
  return res.status >= 200 && res.status < 300;
}

async function removeMember(token, memberId) {
  console.log(`Removing member ${memberId}`);
  console.log(`URL: ${BASE_URL}/teams/${TEAM_ID}/members/${memberId}`);
  
  const res = await fetch(`${BASE_URL}/teams/${TEAM_ID}/members/${memberId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Response status:', res.status);
  const data = await res.text();
  console.log('Response body:', data);
  
  return res.status >= 200 && res.status < 300;
}

(async () => {
  try {
    const token = await loginAndGetToken();
    console.log('Login successful!\n');
    
    // 1. Get current team members
    console.log('=== Current Team Members ===');
    const members = await getTeamMembers(token);
    members.forEach((m, i) => {
      const name = m.user.full_name || m.user.name || '';
      const email = m.user.email || '';
      const id = m.user.id || m.user._id;
      const memberId = m.id || m._id;
      console.log(`${i + 1}. ${name} - ${email} - Role: ${m.role} - MemberID: ${memberId}`);
    });
    
    // 2. Find a non-Admin member to test with
    const nonAdminMember = members.find(m => m.role !== 'Admin');
    if (!nonAdminMember) {
      console.log('\n❌ No non-Admin members found to test with');
      return;
    }
    
    const testMemberId = nonAdminMember.id || nonAdminMember._id;
    const currentRole = nonAdminMember.role;
    console.log(`\n🧪 Testing with member: ${nonAdminMember.user.full_name} (Current role: ${currentRole})`);
    
    // 3. Test role update
    const newRole = currentRole === 'Member' ? 'Editor' : 'Member';
    console.log(`\n=== Testing Role Update: ${currentRole} → ${newRole} ===`);
    const updateSuccess = await updateMemberRole(token, testMemberId, newRole);
    
    if (updateSuccess) {
      console.log('✅ Role update successful!');
      
      // Verify the change
      const updatedMembers = await getTeamMembers(token);
      const updatedMember = updatedMembers.find(m => (m.id || m._id) === testMemberId);
      if (updatedMember && updatedMember.role === newRole) {
        console.log(`✅ Role successfully changed to: ${updatedMember.role}`);
        
        // Change back to original role
        console.log(`\n=== Changing back to original role: ${newRole} → ${currentRole} ===`);
        await updateMemberRole(token, testMemberId, currentRole);
      } else {
        console.log('❌ Role change not reflected in database');
      }
    } else {
      console.log('❌ Role update failed');
    }
    
    console.log('\n=== Test Completed ===');
    
  } catch (error) {
    console.error('Error:', error);
  }
})();
