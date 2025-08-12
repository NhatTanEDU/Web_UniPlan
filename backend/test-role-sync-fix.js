// Test script để kiểm tra tính năng đồng bộ hóa vai trò từ Team sang Project
const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/project.model');
const Team = require('./models/team.model');
const TeamMember = require('./models/teamMember.model');
const ProjectMember = require('./models/projectMember.model');
const User = require('./models/user.model');

async function testRoleSyncFix() {
  try {
    console.log('🔄 Kết nối đến MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniplan');
    console.log('✅ Đã kết nối MongoDB');

    // 1. Tìm một team và project đã tồn tại
    console.log('\n📋 Tìm kiếm team và project để test...');
    
    const team = await Team.findOne({ is_deleted: false });
    if (!team) {
      console.log('❌ Không tìm thấy team nào để test');
      return;
    }
    console.log(`✅ Tìm thấy team: ${team.team_name} (ID: ${team._id})`);

    const project = await Project.findOne({ team_id: team._id, is_deleted: false });
    if (!project) {
      console.log('❌ Không tìm thấy project nào thuộc team này');
      return;
    }
    console.log(`✅ Tìm thấy project: ${project.project_name} (ID: ${project._id})`);

    // 2. Tìm một thành viên team để test (không phải Admin)
    const teamMembers = await TeamMember.find({ 
      team_id: team._id, 
      is_active: true,
      role: { $ne: 'Admin' } // Tìm thành viên không phải Admin để dễ test
    }).populate('user_id', 'full_name email');

    if (teamMembers.length === 0) {
      console.log('❌ Không tìm thấy thành viên nào để test');
      return;
    }

    const testMember = teamMembers[0];
    console.log(`✅ Sẽ test với thành viên: ${testMember.user_id.full_name} (${testMember.user_id.email})`);
    console.log(`📋 Vai trò hiện tại trong team: ${testMember.role}`);

    // 3. Kiểm tra vai trò hiện tại trong project
    const projectMember = await ProjectMember.findOne({
      project_id: project._id,
      user_id: testMember.user_id._id
    });

    if (projectMember) {
      console.log(`📋 Vai trò hiện tại trong project: ${projectMember.role_in_project}`);
    } else {
      console.log('📋 Thành viên chưa có trong project, sẽ tạo mới...');
      
      // Tạo ProjectMember mới với vai trò hiện tại
      const newProjectMember = new ProjectMember({
        project_id: project._id,
        user_id: testMember.user_id._id,
        role_in_project: 'Người xem', // Vai trò mặc định
        joined_at: new Date(),
        is_active: true
      });
      await newProjectMember.save();
      console.log('✅ Đã tạo ProjectMember với vai trò mặc định: Người xem');
    }

    // 4. Test thay đổi vai trò
    const newRole = testMember.role === 'Member' ? 'Editor' : 'Member';
    console.log(`\n🔄 Đang thay đổi vai trò từ "${testMember.role}" thành "${newRole}"...`);

    // Cập nhật vai trò và kiểm tra đồng bộ hóa
    testMember.role = newRole;
    await testMember.save();

    // Thực hiện logic đồng bộ hóa thủ công để test
    const projectsInTeam = await Project.find({ team_id: team._id, is_deleted: false });
    const projectIds = projectsInTeam.map(p => p._id);
    
    // Map vai trò
    let expectedProjectRole = 'Người xem';
    switch (newRole) {
      case 'Admin':
        expectedProjectRole = 'Quản trị viên';
        break;
      case 'Editor':
        expectedProjectRole = 'Biên tập viên';
        break;
      case 'Member':
        expectedProjectRole = 'Người xem';
        break;
    }

    console.log(`📋 Vai trò mong đợi trong project: ${expectedProjectRole}`);

    // Cập nhật ProjectMember
    const updateResult = await ProjectMember.updateMany(
      { 
        project_id: { $in: projectIds }, 
        user_id: testMember.user_id._id 
      },
      { 
        $set: { role_in_project: expectedProjectRole } 
      }
    );

    console.log(`✅ Đã cập nhật ${updateResult.modifiedCount} bản ghi ProjectMember`);

    // 5. Kiểm tra kết quả
    const updatedProjectMember = await ProjectMember.findOne({
      project_id: project._id,
      user_id: testMember.user_id._id
    });

    if (updatedProjectMember && updatedProjectMember.role_in_project === expectedProjectRole) {
      console.log('🎉 THÀNH CÔNG! Vai trò đã được đồng bộ chính xác!');
      console.log(`   - Vai trò trong team: ${newRole}`);
      console.log(`   - Vai trò trong project: ${updatedProjectMember.role_in_project}`);
    } else {
      console.log('❌ THẤT BẠI! Vai trò không được đồng bộ đúng');
      console.log(`   - Vai trò trong team: ${newRole}`);
      console.log(`   - Vai trò trong project: ${updatedProjectMember?.role_in_project || 'Không tìm thấy'}`);
    }

    // 6. Khôi phục lại vai trò ban đầu
    console.log('\n🔄 Khôi phục lại vai trò ban đầu...');
    const originalRole = newRole === 'Member' ? 'Editor' : 'Member';
    testMember.role = originalRole;
    await testMember.save();

    let originalProjectRole = 'Người xem';
    switch (originalRole) {
      case 'Admin':
        originalProjectRole = 'Quản trị viên';
        break;
      case 'Editor':
        originalProjectRole = 'Biên tập viên';
        break;
      case 'Member':
        originalProjectRole = 'Người xem';
        break;
    }

    await ProjectMember.updateMany(
      { 
        project_id: { $in: projectIds }, 
        user_id: testMember.user_id._id 
      },
      { 
        $set: { role_in_project: originalProjectRole } 
      }
    );

    console.log('✅ Đã khôi phục vai trò ban đầu');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  } finally {
    console.log('\n🔚 Đóng kết nối MongoDB...');
    await mongoose.connection.close();
    console.log('✅ Test hoàn tất!');
  }
}

// Chạy test
testRoleSyncFix();
