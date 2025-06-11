const mongoose = require('mongoose');
require('dotenv').config();

const Team = require('./models/team.model');
const TeamMember = require('./models/teamMember.model');
const User = require('./models/user.model');

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB for debugging');
    debugAdminPermissions();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function debugAdminPermissions() {
  try {
    console.log('\n🔍 === DEBUGGING ADMIN PERMISSIONS ===\n');

    // 1. Tìm tất cả users có role Admin trong teams
    const adminMembers = await TeamMember.find({ role: 'Admin' })
      .populate('user_id', 'full_name email name')
      .populate('team_id', 'team_name created_by');

    console.log(`📊 Found ${adminMembers.length} Admin members in teams:`);
    for (const admin of adminMembers) {
      console.log(`- ${admin.user_id?.full_name || admin.user_id?.name} (${admin.user_id?.email}) in team "${admin.team_id?.team_name}"`);
      console.log(`  Role: ${admin.role}, Active: ${admin.is_active}`);
      console.log(`  Team Creator: ${admin.team_id?.created_by}`);
      console.log(`  Is Creator: ${admin.team_id?.created_by?.toString() === admin.user_id?._id?.toString()}`);
      console.log('');
    }

    // 2. Kiểm tra một case cụ thể nếu có admin
    if (adminMembers.length > 0) {
      const testAdmin = adminMembers[0];
      const teamId = testAdmin.team_id._id;
      const adminUserId = testAdmin.user_id._id;

      console.log(`\n🧪 Testing admin permissions for user ${testAdmin.user_id.full_name || testAdmin.user_id.name}:`);
      console.log(`Team: ${testAdmin.team_id.team_name} (${teamId})`);
      console.log(`Admin ID: ${adminUserId}`);

      // Lấy tất cả members trong team này
      const allMembers = await TeamMember.find({ 
        team_id: teamId,
        is_active: true 
      }).populate('user_id', 'full_name email name');

      console.log(`\n👥 All members in team "${testAdmin.team_id.team_name}":`);
      for (const member of allMembers) {
        const canDelete = checkAdminCanDelete(adminUserId, member);
        console.log(`- ${member.user_id?.full_name || member.user_id?.name} (${member.role})`);
        console.log(`  Member ID: ${member._id}`);
        console.log(`  User ID: ${member.user_id._id}`);
        console.log(`  Can Admin delete: ${canDelete.canDelete} - ${canDelete.reason}`);
        console.log('');
      }

      // 3. Mô phỏng việc xóa thành viên
      const membersToDelete = allMembers.filter(m => 
        m.user_id._id.toString() !== adminUserId.toString() && 
        m.role === 'Member'
      );

      if (membersToDelete.length > 0) {
        const targetMember = membersToDelete[0];
        console.log(`\n🎯 Simulating deletion of member: ${targetMember.user_id.full_name || targetMember.user_id.name}`);
        
        // Kiểm tra logic quyền chi tiết
        console.log('Checking permissions:');
        console.log(`- Current user is Admin: true`);
        console.log(`- Target member role: ${targetMember.role}`);
        console.log(`- Is trying to delete self: false`);
        console.log(`- Should be able to delete: true`);
        
        // Kiểm tra trong database thực tế
        const currentMember = await TeamMember.findOne({
          team_id: teamId,
          user_id: adminUserId,
          is_active: true
        });

        console.log(`\nDatabase verification:`);
        console.log(`- Admin membership found: ${!!currentMember}`);
        console.log(`- Admin role in DB: ${currentMember?.role}`);
        console.log(`- Admin is_active: ${currentMember?.is_active}`);
      }
    }

    // 4. Kiểm tra các patterns có thể gây lỗi
    console.log('\n🔍 Checking for potential issues:');
    
    // Kiểm tra inconsistent roles
    const invalidRoles = await TeamMember.find({
      role: { $nin: ['Admin', 'Editor', 'Member'] }
    });
    console.log(`- Members with invalid roles: ${invalidRoles.length}`);

    // Kiểm tra teams không có Admin
    const teamsWithoutAdmin = await Team.aggregate([
      {
        $lookup: {
          from: 'teammembers',
          localField: '_id',
          foreignField: 'team_id',
          as: 'members'
        }
      },
      {
        $match: {
          is_deleted: false,
          'members.role': { $ne: 'Admin' }
        }
      }
    ]);
    console.log(`- Teams without Admin: ${teamsWithoutAdmin.length}`);

    // Kiểm tra multiple Admins
    const teamsWithMultipleAdmins = await TeamMember.aggregate([
      {
        $match: { role: 'Admin', is_active: true }
      },
      {
        $group: {
          _id: '$team_id',
          adminCount: { $sum: 1 },
          admins: { $push: '$user_id' }
        }
      },
      {
        $match: { adminCount: { $gt: 1 } }
      }
    ]);
    console.log(`- Teams with multiple Admins: ${teamsWithMultipleAdmins.length}`);

    if (teamsWithMultipleAdmins.length > 0) {
      console.log('Teams with multiple Admins:');
      for (const team of teamsWithMultipleAdmins) {
        const teamInfo = await Team.findById(team._id);
        console.log(`  - ${teamInfo?.team_name}: ${team.adminCount} admins`);
      }
    }

  } catch (error) {
    console.error('❌ Error debugging admin permissions:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Debugging completed');
  }
}

function checkAdminCanDelete(adminUserId, targetMember) {
  // Logic tương tự như trong controller
  if (targetMember.user_id._id.toString() === adminUserId.toString()) {
    return {
      canDelete: false,
      reason: 'Admin không thể tự xóa khỏi nhóm'
    };
  }
  
  return {
    canDelete: true,
    reason: 'Admin có quyền xóa thành viên khác'
  };
}
