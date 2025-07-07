// Debug script to test team members API from frontend
const teamId = '683a2523ddf616be1a376995';

async function debugTeamMembers() {
  try {
    console.log('🔍 Testing team members API from frontend...');
    
    // First test if we can reach the API
    const response = await fetch(`http://localhost:5000/api/teams/${teamId}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if needed
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
      console.log('Member count:', data.members?.length);
      
      // Log each member structure
      data.members?.forEach((member, index) => {
        console.log(`Member ${index + 1}:`, {
          id: member.id,
          user: member.user,
          role: member.role,
          name: member.user?.full_name,
          email: member.user?.email
        });
      });
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error data:', errorData);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// Run the debug
debugTeamMembers();
