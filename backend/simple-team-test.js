const mongoose = require('mongoose');
require('dotenv').config();

// Đơn giản hóa test
async function simpleTeamTest() {
  try {
    console.log('🔍 Simple Team Display Test\n');
      // Connect to database
    const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/uniplan';
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to database');

    // Import models
    const Team = require('./models/team.model');
    const TeamMember = require('./models/teamMember.model');

    // 1. Check existing teams
    console.log('\n1. Checking existing teams...');
    const existingTeams = await Team.find({ is_deleted: false }).limit(3);
    
    if (existingTeams.length === 0) {
      console.log('❌ No teams found in database');
    } else {
      console.log(`✅ Found ${existingTeams.length} teams:`);
      existingTeams.forEach((team, index) => {
        console.log(`  Team ${index + 1}:`);
        console.log(`    ID: ${team._id}`);
        console.log(`    Name: "${team.team_name}"`);
        console.log(`    Type: "${team.type || 'MISSING TYPE FIELD'}"`);
        console.log(`    Description: "${team.description || 'No description'}"`);
        console.log('    ---');
      });
    }

    // 2. Test team schema
    console.log('\n2. Testing Team schema...');
    const teamSchema = Team.schema.paths;
    const hasNameField = !!teamSchema.team_name;
    const hasTypeField = !!teamSchema.type;
    const hasDescriptionField = !!teamSchema.description;

    console.log(`  team_name field: ${hasNameField ? '✅' : '❌'}`);
    console.log(`  type field: ${hasTypeField ? '✅' : '❌'}`);
    console.log(`  description field: ${hasDescriptionField ? '✅' : '❌'}`);

    if (!hasTypeField) {
      console.log('  ⚠️  WARNING: type field is missing from schema!');
    }

    // 3. Create test team with type
    console.log('\n3. Creating test team with type...');
    try {
      const testTeam = new Team({
        team_name: 'Test Team ' + Date.now(),
        type: 'Development',
        description: 'Test team for type field validation',
        created_by: new mongoose.Types.ObjectId()
      });

      await testTeam.save();
      console.log('✅ Test team created successfully:');
      console.log(`    Name: "${testTeam.team_name}"`);
      console.log(`    Type: "${testTeam.type}"`);
      console.log(`    Description: "${testTeam.description}"`);

      // Clean up
      await Team.findByIdAndDelete(testTeam._id);
      console.log('✅ Test team cleaned up');

    } catch (error) {
      console.log('❌ Error creating test team:', error.message);
    }

    // 4. Test API response format
    console.log('\n4. Testing getTeams API simulation...');
    const teams = await Team.find({ is_deleted: false })
      .select('team_name type description created_at')
      .sort({ team_name: 1 })
      .limit(2);

    console.log('API Response simulation:');
    teams.forEach((team, index) => {
      const teamObj = team.toObject();
      console.log(`  Team ${index + 1}:`, {
        _id: teamObj._id,
        team_name: teamObj.team_name,
        type: teamObj.type || 'No type field',
        description: teamObj.description || 'No description',
        created_at: teamObj.created_at
      });
    });

    console.log('\n✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from database');
  }
}

// Run the test
simpleTeamTest();
