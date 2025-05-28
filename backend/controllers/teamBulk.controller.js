const Team = require('../models/team.model');
const TeamMember = require('../models/teamMember.model');
const Project = require('../models/project.model');
const User = require('../models/user.model');
const responseHelper = require('../utils/responseHelper');

// Thêm nhiều thành viên vào team
const addMultipleMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userIds, role = 'member' } = req.body;
    const currentUserId = req.user.id;

    // Kiểm tra quyền (chỉ admin hoặc leader mới được thêm thành viên)
    const currentMembership = await TeamMember.findOne({
      teamId,
      userId: currentUserId,
      role: { $in: ['admin', 'leader'] }
    });

    if (!currentMembership) {
      return responseHelper.forbiddenResponse(res, 'Chỉ quản trị viên hoặc trưởng nhóm mới có thể thêm thành viên');
    }

    // Kiểm tra team tồn tại
    const team = await Team.findById(teamId);
    if (!team) {
      return responseHelper.notFoundResponse(res, 'Không tìm thấy nhóm');
    }

    // Lấy danh sách thành viên hiện tại
    const currentMembers = await TeamMember.find({ teamId }).select('userId');
    const currentMemberIds = currentMembers.map(m => m.userId.toString());

    // Kiểm tra giới hạn thành viên
    if (team.maxMembers) {
      const newTotalMembers = currentMembers.length + userIds.length;
      if (newTotalMembers > team.maxMembers) {
        return responseHelper.errorResponse(res, 
          `Không thể thêm ${userIds.length} thành viên. Nhóm chỉ có thể chứa tối đa ${team.maxMembers} thành viên. Hiện tại có ${currentMembers.length} thành viên.`, 
          400
        );
      }
    }

    // Kiểm tra tính hợp lệ của userIds
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      const foundUserIds = users.map(u => u._id.toString());
      const invalidIds = userIds.filter(id => !foundUserIds.includes(id));
      return responseHelper.errorResponse(res, 
        `Một số ID người dùng không hợp lệ: ${invalidIds.join(', ')}`, 
        400
      );
    }

    // Phân loại users
    const existingMembers = [];
    const newMembers = [];

    userIds.forEach(userId => {
      if (currentMemberIds.includes(userId)) {
        existingMembers.push(userId);
      } else {
        newMembers.push(userId);
      }
    });

    // Tạo các membership mới
    const newMemberships = [];
    if (newMembers.length > 0) {
      const membershipsToCreate = newMembers.map(userId => ({
        teamId,
        userId,
        role,
        joinedAt: new Date(),
        addedBy: currentUserId
      }));

      const createdMemberships = await TeamMember.insertMany(membershipsToCreate);
      newMemberships.push(...createdMemberships);
    }

    // Lấy thông tin chi tiết của các thành viên mới
    const newMemberDetails = await TeamMember.find({
      _id: { $in: newMemberships.map(m => m._id) }
    }).populate('userId', 'name email avatar');

    const result = {
      teamId,
      teamName: team.name,
      totalRequested: userIds.length,
      successful: newMembers.length,
      skipped: existingMembers.length,
      newMembers: newMemberDetails.map(m => ({
        memberId: m._id,
        user: m.userId,
        role: m.role,
        joinedAt: m.joinedAt
      })),
      skippedUsers: existingMembers,
      summary: {
        message: `Đã thêm ${newMembers.length} thành viên mới. ${existingMembers.length} người đã là thành viên.`,
        newMemberCount: newMembers.length,
        totalMembersNow: currentMembers.length + newMembers.length
      }
    };

    return responseHelper.successResponse(res, result, 'Thêm thành viên hàng loạt thành công');
  } catch (error) {
    console.error('Error adding multiple members:', error);
    return responseHelper.errorResponse(res, 'Lỗi thêm thành viên hàng loạt', 500);
  }
};

// Xóa nhiều thành viên khỏi team
const removeMultipleMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userIds } = req.body;
    const currentUserId = req.user.id;

    // Kiểm tra quyền
    const currentMembership = await TeamMember.findOne({
      teamId,
      userId: currentUserId,
      role: { $in: ['admin', 'leader'] }
    });

    if (!currentMembership) {
      return responseHelper.forbiddenResponse(res, 'Chỉ quản trị viên hoặc trưởng nhóm mới có thể xóa thành viên');
    }

    // Kiểm tra team tồn tại
    const team = await Team.findById(teamId);
    if (!team) {
      return responseHelper.notFoundResponse(res, 'Không tìm thấy nhóm');
    }

    // Lấy thông tin các thành viên cần xóa
    const membersToRemove = await TeamMember.find({
      teamId,
      userId: { $in: userIds }
    }).populate('userId', 'name email avatar');

    if (membersToRemove.length === 0) {
      return responseHelper.errorResponse(res, 'Không tìm thấy thành viên nào để xóa', 400);
    }

    // Kiểm tra không được xóa leader cuối cùng
    const leaders = await TeamMember.find({
      teamId,
      role: 'leader'
    });

    const leadersToRemove = membersToRemove.filter(m => m.role === 'leader');
    if (leadersToRemove.length > 0 && leaders.length <= leadersToRemove.length) {
      return responseHelper.errorResponse(res, 'Không thể xóa tất cả trưởng nhóm. Phải có ít nhất một trưởng nhóm.', 400);
    }

    // Kiểm tra không được tự xóa bản thân nếu là leader duy nhất
    const isCurrentUserLeader = currentMembership.role === 'leader';
    const isRemovingSelf = userIds.includes(currentUserId);
    
    if (isCurrentUserLeader && isRemovingSelf && leaders.length === 1) {
      return responseHelper.errorResponse(res, 'Bạn không thể rời khỏi nhóm khi là trưởng nhóm duy nhất. Hãy chỉ định trưởng nhóm mới trước.', 400);
    }

    // Thực hiện xóa
    const deletedMembers = [];
    const failedDeletions = [];

    for (const member of membersToRemove) {
      try {
        await TeamMember.findByIdAndDelete(member._id);
        deletedMembers.push({
          memberId: member._id,
          user: member.userId,
          role: member.role,
          removedAt: new Date()
        });
      } catch (error) {
        console.error(`Error removing member ${member.userId._id}:`, error);
        failedDeletions.push({
          userId: member.userId._id,
          reason: 'Lỗi khi xóa thành viên'
        });
      }
    }

    // Lấy số lượng thành viên còn lại
    const remainingMembersCount = await TeamMember.countDocuments({ teamId });

    const result = {
      teamId,
      teamName: team.name,
      totalRequested: userIds.length,
      successful: deletedMembers.length,
      failed: failedDeletions.length,
      removedMembers: deletedMembers,
      failedRemovals: failedDeletions,
      summary: {
        message: `Đã xóa ${deletedMembers.length} thành viên. ${failedDeletions.length} thành viên không thể xóa.`,
        removedCount: deletedMembers.length,
        remainingMembersCount
      }
    };

    return responseHelper.successResponse(res, result, 'Xóa thành viên hàng loạt thành công');
  } catch (error) {
    console.error('Error removing multiple members:', error);
    return responseHelper.errorResponse(res, 'Lỗi xóa thành viên hàng loạt', 500);
  }
};

// Cập nhật role cho nhiều thành viên
const updateMultipleMemberRoles = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { updates } = req.body; // Array of { userId, newRole }
    const currentUserId = req.user.id;

    // Kiểm tra quyền
    const currentMembership = await TeamMember.findOne({
      teamId,
      userId: currentUserId,
      role: { $in: ['admin', 'leader'] }
    });

    if (!currentMembership) {
      return responseHelper.forbiddenResponse(res, 'Chỉ quản trị viên hoặc trưởng nhóm mới có thể cập nhật role');
    }

    // Kiểm tra team tồn tại
    const team = await Team.findById(teamId);
    if (!team) {
      return responseHelper.notFoundResponse(res, 'Không tìm thấy nhóm');
    }

    // Validate roles
    const validRoles = ['member', 'admin', 'leader'];
    const invalidUpdates = updates.filter(update => !validRoles.includes(update.newRole));
    
    if (invalidUpdates.length > 0) {
      return responseHelper.errorResponse(res, 
        'Một số role không hợp lệ. Role hợp lệ: member, admin, leader', 
        400
      );
    }

    // Lấy thông tin các thành viên cần cập nhật
    const userIdsToUpdate = updates.map(u => u.userId);
    const membersToUpdate = await TeamMember.find({
      teamId,
      userId: { $in: userIdsToUpdate }
    }).populate('userId', 'name email avatar');

    if (membersToUpdate.length === 0) {
      return responseHelper.errorResponse(res, 'Không tìm thấy thành viên nào để cập nhật', 400);
    }

    // Kiểm tra logic nghiệp vụ
    const currentLeaders = await TeamMember.find({
      teamId,
      role: 'leader'
    });

    const leadersBeingDemoted = updates.filter(update => {
      const member = membersToUpdate.find(m => m.userId._id.toString() === update.userId);
      return member && member.role === 'leader' && update.newRole !== 'leader';
    });

    // Không được giáng chức tất cả leaders
    if (leadersBeingDemoted.length > 0 && currentLeaders.length <= leadersBeingDemoted.length) {
      const newLeaders = updates.filter(update => update.newRole === 'leader');
      if (newLeaders.length === 0) {
        return responseHelper.errorResponse(res, 'Phải có ít nhất một trưởng nhóm. Không thể giáng chức tất cả trưởng nhóm.', 400);
      }
    }

    // Thực hiện cập nhật
    const updatedMembers = [];
    const failedUpdates = [];

    for (const update of updates) {
      try {
        const member = membersToUpdate.find(m => m.userId._id.toString() === update.userId);
        if (!member) {
          failedUpdates.push({
            userId: update.userId,
            reason: 'Không tìm thấy thành viên trong nhóm'
          });
          continue;
        }

        const oldRole = member.role;
        member.role = update.newRole;
        member.updatedAt = new Date();
        member.updatedBy = currentUserId;

        await member.save();

        updatedMembers.push({
          memberId: member._id,
          user: member.userId,
          oldRole,
          newRole: update.newRole,
          updatedAt: member.updatedAt
        });
      } catch (error) {
        console.error(`Error updating member ${update.userId}:`, error);
        failedUpdates.push({
          userId: update.userId,
          reason: 'Lỗi khi cập nhật role'
        });
      }
    }

    const result = {
      teamId,
      teamName: team.name,
      totalRequested: updates.length,
      successful: updatedMembers.length,
      failed: failedUpdates.length,
      updatedMembers,
      failedUpdates,
      summary: {
        message: `Đã cập nhật role cho ${updatedMembers.length} thành viên. ${failedUpdates.length} thành viên không thể cập nhật.`,
        updatedCount: updatedMembers.length
      }
    };

    return responseHelper.successResponse(res, result, 'Cập nhật role hàng loạt thành công');
  } catch (error) {
    console.error('Error updating multiple member roles:', error);
    return responseHelper.errorResponse(res, 'Lỗi cập nhật role hàng loạt', 500);
  }
};

// Gán nhiều projects cho team
const assignMultipleProjects = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { projectIds, role = 'contributor' } = req.body;
    const currentUserId = req.user.id;

    // Kiểm tra quyền
    const currentMembership = await TeamMember.findOne({
      teamId,
      userId: currentUserId,
      role: { $in: ['admin', 'leader'] }
    });

    if (!currentMembership) {
      return responseHelper.forbiddenResponse(res, 'Chỉ quản trị viên hoặc trưởng nhóm mới có thể gán dự án');
    }

    // Kiểm tra team tồn tại
    const team = await Team.findById(teamId);
    if (!team) {
      return responseHelper.notFoundResponse(res, 'Không tìm thấy nhóm');
    }

    // Kiểm tra projects tồn tại
    const projects = await Project.find({ _id: { $in: projectIds } });
    if (projects.length !== projectIds.length) {
      const foundProjectIds = projects.map(p => p._id.toString());
      const invalidIds = projectIds.filter(id => !foundProjectIds.includes(id));
      return responseHelper.errorResponse(res, 
        `Một số ID dự án không hợp lệ: ${invalidIds.join(', ')}`, 
        400
      );
    }

    // Phân loại projects
    const alreadyAssigned = [];
    const newAssignments = [];

    for (const project of projects) {
      if (project.assignedTeam && project.assignedTeam.toString() === teamId) {
        alreadyAssigned.push(project);
      } else {
        newAssignments.push(project);
      }
    }

    // Cập nhật các projects chưa được gán
    const assignedProjects = [];
    const failedAssignments = [];

    for (const project of newAssignments) {
      try {
        project.assignedTeam = teamId;
        project.teamRole = role;
        project.assignedAt = new Date();
        project.assignedBy = currentUserId;
        project.updatedAt = new Date();

        await project.save();
        assignedProjects.push(project);
      } catch (error) {
        console.error(`Error assigning project ${project._id}:`, error);
        failedAssignments.push({
          projectId: project._id,
          projectName: project.name,
          reason: 'Lỗi khi gán dự án'
        });
      }
    }

    const result = {
      teamId,
      teamName: team.name,
      totalRequested: projectIds.length,
      successful: assignedProjects.length,
      skipped: alreadyAssigned.length,
      failed: failedAssignments.length,
      assignedProjects: assignedProjects.map(p => ({
        projectId: p._id,
        projectName: p.name,
        role,
        assignedAt: p.assignedAt
      })),
      skippedProjects: alreadyAssigned.map(p => ({
        projectId: p._id,
        projectName: p.name,
        reason: 'Dự án đã được gán cho nhóm này'
      })),
      failedAssignments,
      summary: {
        message: `Đã gán ${assignedProjects.length} dự án mới. ${alreadyAssigned.length} dự án đã được gán trước đó.`,
        newAssignmentsCount: assignedProjects.length,
        totalProjectsNow: assignedProjects.length + alreadyAssigned.length
      }
    };

    return responseHelper.successResponse(res, result, 'Gán dự án hàng loạt thành công');
  } catch (error) {
    console.error('Error assigning multiple projects:', error);
    return responseHelper.errorResponse(res, 'Lỗi gán dự án hàng loạt', 500);
  }
};

// Xóa nhiều teams (chỉ dành cho admin hoặc người tạo)
const deleteMultipleTeams = async (req, res) => {
  try {
    const { teamIds } = req.body;
    const currentUserId = req.user.id;

    if (!teamIds || teamIds.length === 0) {
      return responseHelper.errorResponse(res, 'Danh sách ID nhóm không được để trống', 400);
    }

    // Lấy thông tin các teams
    const teams = await Team.find({ _id: { $in: teamIds } });
    
    if (teams.length === 0) {
      return responseHelper.errorResponse(res, 'Không tìm thấy nhóm nào để xóa', 400);
    }

    // Kiểm tra quyền xóa từng team
    const deletableTeams = [];
    const undeletableTeams = [];

    for (const team of teams) {
      // Chỉ cho phép xóa nếu user là creator hoặc leader của team
      const isCreator = team.createdBy && team.createdBy.toString() === currentUserId;
      const membership = await TeamMember.findOne({
        teamId: team._id,
        userId: currentUserId,
        role: 'leader'
      });

      if (isCreator || membership) {
        deletableTeams.push(team);
      } else {
        undeletableTeams.push({
          teamId: team._id,
          teamName: team.name,
          reason: 'Bạn không có quyền xóa nhóm này'
        });
      }
    }

    if (deletableTeams.length === 0) {
      return responseHelper.forbiddenResponse(res, 'Bạn không có quyền xóa bất kỳ nhóm nào trong danh sách');
    }

    // Thực hiện xóa
    const deletedTeams = [];
    const failedDeletions = [];

    for (const team of deletableTeams) {
      try {
        // Xóa tất cả thành viên
        await TeamMember.deleteMany({ teamId: team._id });
        
        // Cập nhật projects bỏ assignedTeam
        await Project.updateMany(
          { assignedTeam: team._id },
          { 
            $unset: { 
              assignedTeam: 1, 
              teamRole: 1, 
              assignedAt: 1, 
              assignedBy: 1 
            } 
          }
        );
        
        // Xóa team
        await Team.findByIdAndDelete(team._id);
        
        deletedTeams.push({
          teamId: team._id,
          teamName: team.name,
          deletedAt: new Date()
        });
      } catch (error) {
        console.error(`Error deleting team ${team._id}:`, error);
        failedDeletions.push({
          teamId: team._id,
          teamName: team.name,
          reason: 'Lỗi khi xóa nhóm'
        });
      }
    }

    const result = {
      totalRequested: teamIds.length,
      successful: deletedTeams.length,
      unauthorized: undeletableTeams.length,
      failed: failedDeletions.length,
      deletedTeams,
      undeletableTeams,
      failedDeletions,
      summary: {
        message: `Đã xóa ${deletedTeams.length} nhóm. ${undeletableTeams.length} nhóm không có quyền xóa. ${failedDeletions.length} nhóm không thể xóa.`,
        deletedCount: deletedTeams.length
      }
    };

    return responseHelper.successResponse(res, result, 'Xóa nhóm hàng loạt thành công');
  } catch (error) {
    console.error('Error deleting multiple teams:', error);
    return responseHelper.errorResponse(res, 'Lỗi xóa nhóm hàng loạt', 500);
  }
};

module.exports = {
  addMultipleMembers,
  removeMultipleMembers,
  updateMultipleMemberRoles,
  assignMultipleProjects,
  deleteMultipleTeams
};
