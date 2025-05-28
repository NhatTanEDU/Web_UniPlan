const mongoose = require('mongoose');
const Team = require('../../models/team.model');
const TeamMember = require('../../models/teamMember.model');
const Project = require('../../models/project.model');
const User = require('../../models/user.model');
const { ADMIN_ACCOUNT } = require('../admin-account');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/uniplan', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const debugTeams = async () => {
  try {
    console.log('🔍 DEBUGGING TEAMS MODULE...\n');

    // 1. Kiểm tra kết nối database
    console.log('✅ Database connected');

    // 2. Kiểm tra các collection có dữ liệu không
    const teamsCount = await Team.countDocuments();
    const membersCount = await TeamMember.countDocuments();
    const projectsCount = await Project.countDocuments();
    const usersCount = await User.countDocuments();

    console.log('📊 DATABASE STATS:');
    console.log(`- Teams: ${teamsCount}`);
    console.log(`- Team Members: ${membersCount}`);
    console.log(`- Projects: ${projectsCount}`);
    console.log(`- Users: ${usersCount}\n`);    // 3. Tìm user admin để test
    console.log(`🔍 Tìm user với email: ${ADMIN_ACCOUNT.email}`);
    const adminUser = await User.findOne({ email: ADMIN_ACCOUNT.email });
    if (!adminUser) {
      console.log('❌ Không tìm thấy user admin, thử tìm user khác...');
      
      // Thử tìm user có role Admin
      const anyAdmin = await User.findOne({ role: 'Admin' });
      if (anyAdmin) {
        console.log(`👤 Found user with Admin role: ${anyAdmin.full_name || anyAdmin.name} (${anyAdmin.email})`);
        return await continueDebugWithUser(anyAdmin);
      }
      
      // Thử tìm user bất kỳ
      const anyUser = await User.findOne();
      if (anyUser) {
        console.log(`👤 Found any user: ${anyUser.full_name || anyUser.name} (${anyUser.email})`);
        return await continueDebugWithUser(anyUser);
      }
      
      console.log('❌ Không tìm thấy user nào trong database');
      return;
    }
    console.log(`👤 Found admin user: ${adminUser.full_name || adminUser.name} (${adminUser._id})\n`);
    
    return await continueDebugWithUser(adminUser);
  } catch (error) {
    console.log('❌ MAIN ERROR:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
};

// Hàm tiếp tục debug với user đã tìm thấy
const continueDebugWithUser = async (user) => {
  try {

    // 4. Kiểm tra TeamMember schema
    console.log('🏗️ TEAM MEMBER SCHEMA FIELDS:');
    const sampleMember = await TeamMember.findOne();
    if (sampleMember) {
      console.log('Sample TeamMember object:', JSON.stringify(sampleMember, null, 2));
    } else {
      console.log('No TeamMember found in database');
    }    // 5. Test populate team_id
    console.log('\n🔗 TESTING POPULATE team_id:');
    try {
      const memberships = await TeamMember.find({ user_id: user._id })
        .populate('team_id');
      console.log(`Found ${memberships.length} team memberships for user`);
      
      if (memberships.length > 0) {
        console.log('First membership:', JSON.stringify(memberships[0], null, 2));
      }
    } catch (populateError) {
      console.log('❌ POPULATE ERROR:', populateError.message);
    }

    // 6. Test basic query without populate
    console.log('\n📝 TESTING BASIC QUERY (no populate):');
    const basicMemberships = await TeamMember.find({ user_id: user._id });
    console.log(`Found ${basicMemberships.length} basic memberships`);
    if (basicMemberships.length > 0) {
      console.log('First basic membership:', JSON.stringify(basicMemberships[0], null, 2));
    }

    // 7. Test Team schema
    console.log('\n🏗️ TEAM SCHEMA FIELDS:');
    const sampleTeam = await Team.findOne();
    if (sampleTeam) {
      console.log('Sample Team object:', JSON.stringify(sampleTeam, null, 2));
    } else {
      console.log('No Team found in database');
    }

    // 8. Test Project schema
    console.log('\n🏗️ PROJECT SCHEMA FIELDS:');
    const sampleProject = await Project.findOne();
    if (sampleProject) {
      console.log('Sample Project object:', JSON.stringify(sampleProject, null, 2));
    } else {
      console.log('No Project found in database');
    }

    // 9. Test complete getTeamOverviewStats logic step by step
    console.log('\n🧪 TESTING getTeamOverviewStats LOGIC:');
      try {
      // Step 1: Get user team memberships
      const userTeamMemberships = await TeamMember.find({ user_id: user._id })
        .populate('team_id');
      console.log(`✅ Step 1 - Found ${userTeamMemberships.length} memberships`);

      // Step 2: Extract team IDs
      const userTeamIds = userTeamMemberships
        .map(membership => membership.team_id?._id)
        .filter(Boolean);
      console.log(`✅ Step 2 - Extracted ${userTeamIds.length} team IDs`);

      // Step 3: Count roles
      const teamsAsAdmin = userTeamMemberships.filter(m => m.role === 'Admin').length;
      const teamsAsEditor = userTeamMemberships.filter(m => m.role === 'Editor').length;
      const teamsAsMember = userTeamMemberships.filter(m => m.role === 'Member').length;
      console.log(`✅ Step 3 - Roles: Admin=${teamsAsAdmin}, Editor=${teamsAsEditor}, Member=${teamsAsMember}`);

      // Step 4: Get team projects
      const teamProjects = await Project.find({ team_id: { $in: userTeamIds } });
      console.log(`✅ Step 4 - Found ${teamProjects.length} team projects`);

      // Step 5: Get all team members
      const allTeamMembers = await TeamMember.find({ team_id: { $in: userTeamIds } });
      console.log(`✅ Step 5 - Found ${allTeamMembers.length} total team members`);

      console.log('\n🎉 ALL STEPS COMPLETED SUCCESSFULLY!');

    } catch (stepError) {
      console.log('❌ ERROR in step-by-step test:', stepError.message);
      console.log('Stack:', stepError.stack);
    }

  } catch (error) {
    console.log('❌ MAIN ERROR:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
};

    } catch (stepError) {
      console.log('❌ ERROR in step-by-step test:', stepError.message);
      console.log('Stack:', stepError.stack);
    }

  } catch (error) {
    console.log('❌ MAIN ERROR:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
};

debugTeams();
