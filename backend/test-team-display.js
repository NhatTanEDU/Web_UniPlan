const mongoose = require('mongoose');
const Team = require('./models/team.model');
const TeamMember = require('./models/teamMember.model');
const User = require('./models/user.model');

// Test để kiểm tra hiển thị tên và loại của team
async function testTeamDisplay() {
  try {
    console.log('🔍 Testing Team Display - Name and Type Issues\n');

    // 1. Kiểm tra dữ liệu team trong database
    console.log('1. Checking existing teams in database...');
    const allTeams = await Team.find({ is_deleted: false }).limit(5);
    
    console.log(`Found ${allTeams.length} teams:`);
    allTeams.forEach((team, index) => {
      console.log(`  Team ${index + 1}:`);
      console.log(`    ID: ${team._id}`);
      console.log(`    team_name: "${team.team_name}"`);
      console.log(`    name: "${team.name || 'Not set'}"`);
      console.log(`    type: "${team.type || 'Not set'}"`);
      console.log(`    description: "${team.description || 'Not set'}"`);
      console.log(`    created_at: ${team.created_at}`);
      console.log('    ---');
    });

    // 2. Tạo team test với đầy đủ thông tin
    console.log('\n2. Creating test team with complete data...');
    const testTeam = new Team({
      team_name: 'Test Team Display',
      type: 'Development',
      description: 'Team for testing display issues',
      created_by: new mongoose.Types.ObjectId()
    });

    await testTeam.save();
    console.log('✅ Test team created successfully:');
    console.log(`    ID: ${testTeam._id}`);
    console.log(`    team_name: "${testTeam.team_name}"`);
    console.log(`    type: "${testTeam.type}"`);
    console.log(`    description: "${testTeam.description}"`);

    // 3. Test API response format
    console.log('\n3. Testing API response format...');
    const apiTeam = await Team.findById(testTeam._id)
      .populate('created_by', 'full_name email')
      .lean();

    console.log('API Response format:');
    console.log(JSON.stringify(apiTeam, null, 2));

    // 4. Kiểm tra schema của Team model
    console.log('\n4. Checking Team model schema...');
    const teamSchema = Team.schema.paths;
    console.log('Available fields in Team schema:');
    Object.keys(teamSchema).forEach(field => {
      console.log(`    ${field}: ${teamSchema[field].instance || teamSchema[field].constructor.name}`);
    });

    // 5. Test getTeams controller logic
    console.log('\n5. Testing getTeams controller logic...');
    
    // Simulate controller logic
    const conditions = {
      is_deleted: false
    };

    const sort = { team_name: 1 };

    const teams = await Team.find(conditions)
      .populate('created_by', 'full_name email')
      .sort(sort)
      .limit(3);

    console.log('Controller response simulation:');
    teams.forEach((team, index) => {
      const teamObj = team.toObject();
      console.log(`  Team ${index + 1}:`);
      console.log(`    _id: ${teamObj._id}`);
      console.log(`    team_name: "${teamObj.team_name}"`);
      console.log(`    type: "${teamObj.type || 'undefined'}"`);
      console.log(`    description: "${teamObj.description || 'undefined'}"`);
      console.log(`    created_by: ${teamObj.created_by ? teamObj.created_by.full_name : 'Not populated'}`);
      console.log('    ---');
    });

    // 6. Cleanup test data
    console.log('\n6. Cleaning up test data...');
    await Team.findByIdAndDelete(testTeam._id);
    console.log('✅ Test team deleted');

    // 7. Summary và recommendations
    console.log('\n📊 SUMMARY AND RECOMMENDATIONS:');
    console.log('=================================');
    
    const teamsWithoutType = await Team.countDocuments({ 
      is_deleted: false, 
      $or: [{ type: { $exists: false } }, { type: null }, { type: '' }] 
    });
    
    const teamsWithoutName = await Team.countDocuments({ 
      is_deleted: false, 
      $or: [{ team_name: { $exists: false } }, { team_name: null }, { team_name: '' }] 
    });

    console.log(`📈 Teams without type: ${teamsWithoutType}`);
    console.log(`📈 Teams without name: ${teamsWithoutName}`);
    
    if (teamsWithoutType > 0) {
      console.log('⚠️  Issue found: Some teams missing type field');
      console.log('   Recommendation: Add default type or migration script');
    }
    
    if (teamsWithoutName > 0) {
      console.log('⚠️  Issue found: Some teams missing team_name field');
      console.log('   Recommendation: Check team creation validation');
    }

    console.log('\n✅ Team display test completed');

  } catch (error) {
    console.error('❌ Error in team display test:', error);
  }
}

// Test frontend data handling
async function testFrontendDataStructure() {
  console.log('\n🎨 Testing Frontend Data Structure Requirements\n');

  try {
    // Simulate what frontend expects
    const sampleTeam = await Team.findOne({ is_deleted: false });
    
    if (!sampleTeam) {
      console.log('❌ No teams found for frontend testing');
      return;
    }

    console.log('Original team data from DB:');
    console.log(JSON.stringify(sampleTeam, null, 2));

    // Simulate controller response with memberCount
    const memberCount = await TeamMember.countDocuments({ 
      team_id: sampleTeam._id, 
      is_active: true 
    });

    const frontendReadyTeam = {
      ...sampleTeam.toObject(),
      memberCount,
      userRole: 'Admin' // Simulated
    };

    console.log('\nFrontend-ready team data:');
    console.log(JSON.stringify(frontendReadyTeam, null, 2));

    // Check for missing fields that frontend might need
    const requiredFrontendFields = ['_id', 'team_name', 'type', 'description', 'memberCount'];
    const missingFields = requiredFrontendFields.filter(field => !frontendReadyTeam[field]);

    if (missingFields.length > 0) {
      console.log(`⚠️  Missing fields for frontend: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ All required frontend fields are present');
    }

  } catch (error) {
    console.error('❌ Error in frontend data structure test:', error);
  }
}

// Chạy tests
async function runAllTests() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/uniplan', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📡 Connected to database');

    await testTeamDisplay();
    await testFrontendDataStructure();

  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from database');
  }
}

// Export for use in other files
module.exports = {
  testTeamDisplay,
  testFrontendDataStructure,
  runAllTests
};

// Run if called directly
if (require.main === module) {
  runAllTests();
}
