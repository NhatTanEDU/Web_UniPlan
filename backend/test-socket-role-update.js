const axios = require('axios');
const io = require('socket.io-client');
const mongoose = require('mongoose');
require('dotenv').config();

// Test configuration
const BASE_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

// Test data - replace with actual values from your database
const TEST_CONFIG = {
  teamId: null, // Will be set dynamically
  memberId: null, // Will be set dynamically
  adminToken: null, // Will be set after login
  testEmail: 'admin@test.com', // Replace with actual admin email
  testPassword: 'admin123' // Replace with actual admin password
};

class SocketRoleUpdateTester {
  constructor() {
    this.socket = null;
    this.events = [];
  }

  async connectSocket(teamId) {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        autoConnect: false,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        
        // Join team room
        this.socket.emit('join_team', teamId);
        console.log(`📍 Joined team room: ${teamId}`);
        
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        reject(error);
      });

      // Listen for team member update events
      this.socket.on('team:member_updated', (data) => {
        console.log('🔔 Received team:member_updated event:', data);
        this.events.push({
          event: 'team:member_updated',
          data: data,
          timestamp: new Date()
        });
      });

      this.socket.connect();
    });
  }

  async login() {
    try {
      console.log('🔑 Logging in...');
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_CONFIG.testEmail,
        password: TEST_CONFIG.testPassword
      });

      if (response.data.success && response.data.token) {
        TEST_CONFIG.adminToken = response.data.token;
        console.log('✅ Login successful');
        return true;
      } else {
        console.error('❌ Login failed:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      return false;
    }
  }

  async findTestTeamAndMember() {
    try {
      console.log('🔍 Finding test team and member...');
      
      // Get teams
      const teamsResponse = await axios.get(`${BASE_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${TEST_CONFIG.adminToken}` }
      });

      if (!teamsResponse.data.success || !teamsResponse.data.teams.length) {
        console.error('❌ No teams found');
        return false;
      }

      const team = teamsResponse.data.teams[0];
      TEST_CONFIG.teamId = team._id;
      console.log(`✅ Using team: ${team.team_name} (${team._id})`);

      // Get team members
      const membersResponse = await axios.get(`${BASE_URL}/api/teams/${TEST_CONFIG.teamId}/members`, {
        headers: { Authorization: `Bearer ${TEST_CONFIG.adminToken}` }
      });

      if (!membersResponse.data.success || !membersResponse.data.members.length) {
        console.error('❌ No team members found');
        return false;
      }

      // Find a member who is not admin
      const member = membersResponse.data.members.find(m => m.role !== 'Admin');
      if (!member) {
        console.error('❌ No non-admin members found to test with');
        return false;
      }

      TEST_CONFIG.memberId = member._id;
      console.log(`✅ Using member: ${member.user_id?.full_name || 'Unknown'} (${member._id}) - Current role: ${member.role}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error finding test data:', error.response?.data || error.message);
      return false;
    }
  }

  async updateMemberRole(newRole) {
    try {
      console.log(`🔄 Updating member role to: ${newRole}`);
      
      const response = await axios.put(
        `${BASE_URL}/api/teams/${TEST_CONFIG.teamId}/members/${TEST_CONFIG.memberId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${TEST_CONFIG.adminToken}` } }
      );

      if (response.data.success) {
        console.log('✅ Role update successful');
        return true;
      } else {
        console.error('❌ Role update failed:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Role update error:', error.response?.data || error.message);
      return false;
    }
  }

  async waitForEvent(timeout = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkEvents = () => {
        if (this.events.length > 0) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          resolve(false);
        } else {
          setTimeout(checkEvents, 100);
        }
      };
      checkEvents();
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Socket disconnected');
    }
  }

  printEventSummary() {
    console.log('\n📊 EVENT SUMMARY:');
    console.log(`Total events received: ${this.events.length}`);
    this.events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.event} at ${event.timestamp.toISOString()}`);
      console.log(`   Data:`, JSON.stringify(event.data, null, 2));
    });
  }
}

async function runSocketTest() {
  console.log('🚀 Starting Socket.IO Role Update Test\n');
  
  const tester = new SocketRoleUpdateTester();
  
  try {
    // Step 1: Login
    const loginSuccess = await tester.login();
    if (!loginSuccess) {
      console.error('❌ Test failed: Could not login');
      return;
    }

    // Step 2: Find test data
    const dataFound = await tester.findTestTeamAndMember();
    if (!dataFound) {
      console.error('❌ Test failed: Could not find test data');
      return;
    }

    // Step 3: Connect socket
    await tester.connectSocket(TEST_CONFIG.teamId);
    
    // Wait a moment for socket to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Test role updates
    console.log('\n🧪 Testing role updates...');
    
    // Test 1: Update to Editor
    console.log('\n--- Test 1: Update to Editor ---');
    tester.events = []; // Clear previous events
    await tester.updateMemberRole('Editor');
    const event1Received = await tester.waitForEvent(3000);
    
    if (event1Received) {
      console.log('✅ Socket event received for Editor role update');
    } else {
      console.log('❌ No socket event received for Editor role update');
    }

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Update to Member
    console.log('\n--- Test 2: Update to Member ---');
    tester.events = []; // Clear previous events
    await tester.updateMemberRole('Member');
    const event2Received = await tester.waitForEvent(3000);
    
    if (event2Received) {
      console.log('✅ Socket event received for Member role update');
    } else {
      console.log('❌ No socket event received for Member role update');
    }

    // Print summary
    tester.printEventSummary();

    // Test results
    const totalEvents = tester.events.length;
    if (totalEvents >= 2) {
      console.log('\n🎉 TEST PASSED: Socket.IO events are working correctly!');
    } else if (totalEvents >= 1) {
      console.log('\n⚠️  TEST PARTIALLY PASSED: Some events received, but not all');
    } else {
      console.log('\n❌ TEST FAILED: No socket events received');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    tester.disconnect();
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

// Run the test
runSocketTest().catch(console.error);
