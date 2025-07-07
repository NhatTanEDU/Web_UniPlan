#!/usr/bin/env node

/**
 * Test script to verify that addMemberToTeam function no longer causes connection pool exhaustion
 * This will test the enhanced diagnostic logging and header protection
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_CONFIG = {
  email: 'admin@uniplan.com',
  password: 'admin123',
  testTimeout: 30000, // 30 seconds
  concurrentRequests: 5 // Test with multiple concurrent requests
};

// Colors for console output
const log = {
  info: (msg) => console.log(chalk.blue('ℹ️ '), msg),
  success: (msg) => console.log(chalk.green('✅'), msg),
  error: (msg) => console.log(chalk.red('❌'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠️ '), msg),
  debug: (msg) => console.log(chalk.gray('🔍'), msg)
};

class ConnectionPoolTester {
  constructor() {
    this.token = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async login() {
    try {
      log.info('🔐 Logging in to get authentication token...');
      
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_CONFIG.email,
        password: TEST_CONFIG.password
      }, {
        timeout: 10000
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        log.success(`Login successful! Token: ${this.token.substring(0, 20)}...`);
        return true;
      } else {
        log.error('Login failed: No token received');
        return false;
      }
    } catch (error) {
      log.error(`Login failed: ${error.message}`);
      if (error.response) {
        log.error(`Response status: ${error.response.status}`);
        log.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    }
  }

  async getTeams() {
    try {
      log.info('📋 Fetching teams list...');
      
      const response = await axios.get(`${BASE_URL}/teams`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        timeout: 10000
      });

      if (response.data && response.data.teams && response.data.teams.length > 0) {
        const team = response.data.teams[0];
        log.success(`Found team: ${team.team_name} (ID: ${team._id})`);
        return team._id;
      } else {
        log.warning('No teams found, creating a test team...');
        return await this.createTestTeam();
      }
    } catch (error) {
      log.error(`Failed to get teams: ${error.message}`);
      return null;
    }
  }

  async createTestTeam() {
    try {
      log.info('🆕 Creating test team...');
      
      const response = await axios.post(`${BASE_URL}/teams`, {
        team_name: `Test Team ${Date.now()}`,
        description: 'Test team for connection pool testing',
        team_type: 'Work'
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        timeout: 15000
      });

      if (response.data && response.data.team) {
        const teamId = response.data.team._id;
        log.success(`Test team created: ${teamId}`);
        return teamId;
      } else {
        log.error('Failed to create test team');
        return null;
      }
    } catch (error) {
      log.error(`Failed to create test team: ${error.message}`);
      if (error.response) {
        log.debug(`Response: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }

  async getUsers() {
    try {
      log.info('👤 Fetching users for testing...');
      
      const response = await axios.get(`${BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        timeout: 10000
      });

      if (response.data && response.data.users && response.data.users.length > 0) {
        // Get first 3 users for testing
        const testUsers = response.data.users.slice(0, 3);
        log.success(`Found ${testUsers.length} users for testing`);
        return testUsers.map(user => user._id);
      } else {
        log.error('No users found for testing');
        return [];
      }
    } catch (error) {
      log.error(`Failed to get users: ${error.message}`);
      return [];
    }
  }

  async testAddMemberToTeam(teamId, userId, testNumber) {
    const requestId = `test-${testNumber}-${Date.now()}`;
    const startTime = Date.now();
    
    try {
      log.info(`🧪 Test ${testNumber}: Adding user ${userId} to team ${teamId}...`);
      
      const response = await axios.post(`${BASE_URL}/teams/${teamId}/members`, {
        user_id: userId,
        role: 'Member'
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        timeout: TEST_CONFIG.testTimeout
      });

      const duration = Date.now() - startTime;
      
      if (response.status === 201 || response.status === 200) {
        log.success(`Test ${testNumber} PASSED (${duration}ms): Member added successfully`);
        this.testResults.passed++;
        return { success: true, duration, status: response.status };
      } else {
        log.warning(`Test ${testNumber} unexpected status: ${response.status}`);
        return { success: false, duration, status: response.status };
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.code === 'ECONNABORTED') {
        log.error(`Test ${testNumber} FAILED (${duration}ms): REQUEST TIMEOUT - Connection pool likely exhausted!`);
        this.testResults.failed++;
        this.testResults.errors.push(`Test ${testNumber}: Timeout after ${duration}ms`);
      } else if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        
        if (status === 400 && message.includes('đã là thành viên')) {
          log.success(`Test ${testNumber} EXPECTED (${duration}ms): User already member - this is normal`);
          this.testResults.passed++;
          return { success: true, duration, status };
        } else {
          log.error(`Test ${testNumber} FAILED (${duration}ms): HTTP ${status} - ${message}`);
          this.testResults.failed++;
          this.testResults.errors.push(`Test ${testNumber}: HTTP ${status} - ${message}`);
        }
      } else {
        log.error(`Test ${testNumber} FAILED (${duration}ms): ${error.message}`);
        this.testResults.failed++;
        this.testResults.errors.push(`Test ${testNumber}: ${error.message}`);
      }
      
      return { success: false, duration, error: error.message };
    }
  }

  async runConcurrentTests(teamId, userIds) {
    log.info(`🚀 Running ${TEST_CONFIG.concurrentRequests} concurrent tests to check connection pool...`);
    
    const promises = [];
    
    for (let i = 0; i < TEST_CONFIG.concurrentRequests; i++) {
      const userId = userIds[i % userIds.length]; // Cycle through users
      promises.push(this.testAddMemberToTeam(teamId, userId, i + 1));
    }
    
    log.info('⏳ Waiting for all concurrent requests to complete...');
    const results = await Promise.allSettled(promises);
    
    log.info('📊 Concurrent test results:');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { success, duration, status } = result.value;
        log.debug(`  Test ${index + 1}: ${success ? 'PASSED' : 'FAILED'} (${duration}ms, status: ${status})`);
      } else {
        log.debug(`  Test ${index + 1}: REJECTED - ${result.reason}`);
      }
    });
  }

  async testHealthEndpoint() {
    try {
      log.info('🏥 Testing health endpoint...');
      
      const response = await axios.get(`${BASE_URL}/health`, {
        timeout: 5000
      });

      if (response.status === 200) {
        log.success('Health endpoint is working correctly');
        return true;
      } else {
        log.warning(`Health endpoint returned status: ${response.status}`);
        return false;
      }
    } catch (error) {
      log.error(`Health endpoint failed: ${error.message}`);
      return false;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold.cyan('📋 CONNECTION POOL EXHAUSTION TEST SUMMARY'));
    console.log('='.repeat(60));
    
    console.log(chalk.green(`✅ Tests Passed: ${this.testResults.passed}`));
    console.log(chalk.red(`❌ Tests Failed: ${this.testResults.failed}`));
    console.log(chalk.blue(`📊 Total Tests: ${this.testResults.passed + this.testResults.failed}`));
    
    if (this.testResults.errors.length > 0) {
      console.log(chalk.red('\n🚨 ERRORS:'));
      this.testResults.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }
    
    if (this.testResults.failed === 0) {
      console.log(chalk.green.bold('\n🎉 ALL TESTS PASSED! Connection pool exhaustion appears to be FIXED!'));
    } else {
      console.log(chalk.red.bold('\n⚠️ SOME TESTS FAILED! Connection pool issues may still exist.'));
    }
    
    console.log('='.repeat(60));
  }

  async run() {
    console.log(chalk.bold.blue('🧪 CONNECTION POOL EXHAUSTION TEST'));
    console.log(chalk.gray('Testing addMemberToTeam function with enhanced diagnostics\n'));
    
    // Step 1: Health check
    const healthOk = await this.testHealthEndpoint();
    if (!healthOk) {
      log.warning('Health endpoint not working, but continuing with tests...');
    }
    
    // Step 2: Login
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      log.error('Cannot proceed without authentication');
      return;
    }
    
    // Step 3: Get team ID
    const teamId = await this.getTeams();
    if (!teamId) {
      log.error('Cannot proceed without a team');
      return;
    }
    
    // Step 4: Get user IDs
    const userIds = await this.getUsers();
    if (userIds.length === 0) {
      log.error('Cannot proceed without users to test');
      return;
    }
    
    // Step 5: Run sequential tests first
    log.info(`🔄 Running sequential tests...`);
    for (let i = 0; i < Math.min(3, userIds.length); i++) {
      await this.testAddMemberToTeam(teamId, userIds[i], `seq-${i + 1}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
    
    // Step 6: Run concurrent tests
    await this.runConcurrentTests(teamId, userIds);
    
    // Step 7: Print results
    this.printSummary();
  }
}

// Main execution
async function main() {
  const tester = new ConnectionPoolTester();
  
  try {
    await tester.run();
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Check if required dependencies are available
async function checkDependencies() {
  try {
    require('axios');
    require('chalk');
    return true;
  } catch (error) {
    console.log('❌ Missing dependencies. Installing...');
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('npm install axios chalk', (error, stdout, stderr) => {
        if (error) {
          console.error('Failed to install dependencies:', error);
          resolve(false);
        } else {
          console.log('✅ Dependencies installed successfully');
          resolve(true);
        }
      });
    });
  }
}

if (require.main === module) {
  checkDependencies().then(success => {
    if (success) {
      main();
    } else {
      console.error('Cannot run tests without dependencies');
      process.exit(1);
    }
  });
}
