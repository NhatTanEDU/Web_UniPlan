// Test script to verify role mapping fix for syncTeamMembersToProject
const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/project.model');
const Team = require('./models/team.model');
const TeamMember = require('./models/teamMember.model');
const ProjectMember = require('./models/projectMember.model');
const User = require('./models/user.model');
const { syncTeamMembersToProject } = require('./controllers/project.controller');

async function testRoleMappingFix() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find or create test users
    console.log('\n📋 Setting up test data...');
    
    let adminUser = await User.findOne({ email: 'admin.test@example.com' });
    if (!adminUser) {
      adminUser = new User({
        email: 'admin.test@example.com',
        password: 'hashedpassword',
        full_name: 'Admin Test User',
        role: 'User'
      });
      await adminUser.save();
    }
    
    let editorUser = await User.findOne({ email: 'editor.test@example.com' });
    if (!editorUser) {
      editorUser = new User({
        email: 'editor.test@example.com',
        password: 'hashedpassword',
        full_name: 'Editor Test User',
        role: 'User'
      });
      await editorUser.save();
    }
    
    let memberUser = await User.findOne({ email: 'member.test@example.com' });
    if (!memberUser) {
      memberUser = new User({
        email: 'member.test@example.com',
        password: 'hashedpassword',
        full_name: 'Member Test User',
        role: 'User'
      });
      await memberUser.save();
    }

    // 2. Create test team
    console.log('👥 Creating test team...');
    const testTeam = new Team({
      team_name: 'Role Mapping Test Team',
      description: 'Team for testing role mapping fix',
      created_by: adminUser._id
    });
    await testTeam.save();

    // 3. Add team members with different roles
    console.log('➕ Adding team members...');
    
    const teamMembers = [
      {
        team_id: testTeam._id,
        user_id: adminUser._id,
        role: 'Admin',
        is_active: true
      },
      {
        team_id: testTeam._id,
        user_id: editorUser._id,
        role: 'Editor',
        is_active: true
      },
      {
        team_id: testTeam._id,
        user_id: memberUser._id,
        role: 'Member',
        is_active: true
      }
    ];

    await TeamMember.insertMany(teamMembers);
    console.log('✅ Team members created');    // 4. Create test project
    console.log('📁 Creating test project...');
    
    // First get or create a project type
    const ProjectType = require('./models/projectType.model');
    let projectType = await ProjectType.findOne({ name: 'Test' });
    if (!projectType) {
      projectType = new ProjectType({
        name: 'Test',
        description: 'Test project type'
      });
      await projectType.save();
    }
    
    const testProject = new Project({
      project_name: 'Role Mapping Test Project',
      description: 'Project for testing role mapping',
      created_by: adminUser._id,
      team_id: testTeam._id,
      project_type_id: projectType._id,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'Active',
      priority: 'Medium'
    });
    await testProject.save();

    // 5. Test the syncTeamMembersToProject function
    console.log('\n🔄 Testing syncTeamMembersToProject function...');
    
    const syncResult = await syncTeamMembersToProject(testProject._id, testTeam._id);
    
    console.log('Sync result:', syncResult);

    // 6. Verify the results
    console.log('\n📊 Verifying role mappings...');
    
    const projectMembers = await ProjectMember.find({
      project_id: testProject._id
    }).populate('user_id', 'full_name email');

    console.log('\nProject Members Created:');
    projectMembers.forEach(member => {
      console.log(`- ${member.user_id.full_name}: ${member.role_in_project}`);
    });

    // 7. Verify correct role mappings
    const expectedMappings = {
      [adminUser._id.toString()]: 'Quản trị viên',
      [editorUser._id.toString()]: 'Biên tập viên', 
      [memberUser._id.toString()]: 'Người xem'
    };

    let allCorrect = true;
    for (const member of projectMembers) {
      const userId = member.user_id._id.toString();
      const expectedRole = expectedMappings[userId];
      const actualRole = member.role_in_project;
      
      if (expectedRole === actualRole) {
        console.log(`✅ ${member.user_id.full_name}: ${actualRole} (correct)`);
      } else {
        console.log(`❌ ${member.user_id.full_name}: Expected ${expectedRole}, got ${actualRole}`);
        allCorrect = false;
      }
    }

    if (allCorrect && syncResult.success) {
      console.log('\n🎉 ROLE MAPPING FIX SUCCESS! All team roles correctly mapped to project roles.');
    } else {
      console.log('\n❌ ROLE MAPPING FIX FAILED! Some roles were not mapped correctly.');
    }

    // 8. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await ProjectMember.deleteMany({ project_id: testProject._id });
    await Project.deleteOne({ _id: testProject._id });
    await TeamMember.deleteMany({ team_id: testTeam._id });
    await Team.deleteOne({ _id: testTeam._id });
    await User.deleteMany({ 
      email: { $in: ['admin.test@example.com', 'editor.test@example.com', 'member.test@example.com'] }
    });
    console.log('✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testRoleMappingFix();
