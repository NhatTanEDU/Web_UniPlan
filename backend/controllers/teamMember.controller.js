const TeamMember = require('../models/teamMember.model');
const Team = require('../models/team.model');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const ProjectMember = require('../models/projectMember.model');

// Helper function để map vai trò (nên đặt ở đầu file hoặc file helper riêng)
function mapTeamRoleToProjectRole(teamRole) {
    switch (teamRole) {
        case 'Admin':
            return 'Quản trị viên';
        case 'Editor':
            return 'Biên tập viên';
        case 'Member':
            return 'Người xem';
        default:
            return 'Người xem';
    }
}

// Thêm thành viên vào nhóm
exports.addMember = async (req, res) => {
  try {
    const { team_id, user_id, role = 'Member' } = req.body;
    const currentUserId = req.user.userId; // Thay đổi ở đây

    // Kiểm tra quyền (Admin hoặc Editor)
    const currentMember = await TeamMember.findOne({
      team_id,
      user_id: currentUserId,
      role: { $in: ['Admin', 'Editor'] },
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm thành viên' });
    }

    // Kiểm tra nhóm có tồn tại
    const team = await Team.findOne({ _id: team_id, is_deleted: false });
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Kiểm tra user có tồn tại
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra user đã là thành viên chưa
    const existingMember = await TeamMember.findOne({ team_id, user_id });
    if (existingMember) {
      if (existingMember.is_active) {
        return res.status(400).json({ message: 'Người dùng đã là thành viên của nhóm' });
      } else {
        // Kích hoạt lại thành viên
        existingMember.is_active = true;
        existingMember.role = role;
        await existingMember.save();
          const memberWithUser = await TeamMember.findById(existingMember._id)
          .populate('user_id', 'full_name email avatar_url');
          
        return res.json({
          message: 'Thêm thành viên thành công',
          member: memberWithUser
        });
      }
    }

    // Tạo thành viên mới
    const newMember = new TeamMember({
      team_id,
      user_id,
      role
    });

    await newMember.save();    const memberWithUser = await TeamMember.findById(newMember._id)
      .populate('user_id', 'full_name email avatar_url');

    res.status(201).json({
      message: 'Thêm thành viên thành công',
      member: memberWithUser
    });

  } catch (error) {
    console.error('Error adding member:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Thành viên đã tồn tại trong nhóm' });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật vai trò thành viên
exports.updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params; // ID của team member
    const { role } = req.body;
    const currentUserId = req.user.userId; // Thay đổi ở đây

    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).json({ message: 'Không tìm thấy thành viên' });
    }

    // Kiểm tra quyền
    const currentMember = await TeamMember.findOne({
      team_id: member.team_id,
      user_id: currentUserId,
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền trong nhóm này' });
    }

    // Quy tắc phân quyền
    if (currentMember.role === 'Admin') {
      // Admin có thể sửa tất cả, trừ chính mình
      if (member.user_id.toString() === currentUserId.toString()) {
        return res.status(400).json({ message: 'Không thể tự sửa vai trò của chính mình' });
      }
    } else if (currentMember.role === 'Editor') {
      // Editor chỉ có thể sửa Member, không sửa Admin/Editor
      if (member.role !== 'Member') {
        return res.status(403).json({ message: 'Bạn không có quyền sửa vai trò này' });
      }
      if (role === 'Admin') {
        return res.status(403).json({ message: 'Bạn không có quyền gán vai trò Admin' });
      }
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền sửa vai trò thành viên' });
    }

    member.role = role;
    await member.save();

    // =================================================================
    // ===== BẮT ĐẦU ĐOẠN CODE ĐỒNG BỘ HÓA VAI TRÒ (THÊM VÀO ĐÂY) =====
    // =================================================================
    try {
        console.log(`[SYNC] Bắt đầu đồng bộ vai trò cho user: ${member.user_id} trong team: ${member.team_id}`);
        
        // 1. Tìm tất cả các dự án thuộc về team này
        const projectsInTeam = await Project.find({ team_id: member.team_id, is_deleted: false });

        if (projectsInTeam.length > 0) {
            const projectIds = projectsInTeam.map(p => p._id);
            const newProjectRole = mapTeamRoleToProjectRole(member.role);

            console.log(`[SYNC] Team có ${projectsInTeam.length} dự án. Đang cập nhật vai trò thành "${newProjectRole}".`);

            // 2. Cập nhật vai trò của user này trong tất cả các ProjectMember tương ứng
            const updateResult = await ProjectMember.updateMany(
                { 
                    project_id: { $in: projectIds }, 
                    user_id: member.user_id 
                },
                { 
                    $set: { role_in_project: newProjectRole } 
                }
            );

            console.log(`[SYNC] Đã cập nhật ${updateResult.modifiedCount} bản ghi ProjectMember.`);
        } else {
            console.log(`[SYNC] Team không có dự án nào để đồng bộ.`);
        }

    } catch (syncError) {
        // Ghi lại lỗi đồng bộ nhưng không làm request chính thất bại
        console.error('LỖI ĐỒNG BỘ VAI TRÒ:', syncError);
    }
    // =================================================================
    // ===== KẾT THÚC ĐOẠN CODE ĐỒNG BỘ HÓA VAI TRÒ                  =====
    // =================================================================

    const updatedMember = await TeamMember.findById(member._id)
      .populate('user_id', 'full_name email avatar_url');

    // =====================================================================
    // ===== BẮT ĐẦU ĐOẠN CODE SOCKET.IO CẦN THÊM VÀO ========================
    // =====================================================================
    console.log('🔍 [SOCKET DEBUG - OLD FUNCTION] Checking req.io availability:', {
      reqIoExists: !!req.io,
      reqIoType: typeof req.io,
      appSocketio: !!req.app.get('socketio'),
      appSocketioType: typeof req.app.get('socketio')
    });

    if (req.io) {
        // Lấy teamId từ chính bản ghi member vừa được cập nhật
        const teamId = updatedMember.team_id.toString();

        // Tên sự kiện để cho frontend lắng nghe
        const eventName = 'team:member_updated';

        console.log(`✅ [SOCKET - OLD FUNCTION] req.io is available! Emitting event '${eventName}' to room '${teamId}'`);

        // Gửi sự kiện đến tất cả client trong room của team đó
        // Payload là toàn bộ thông tin của member đã được cập nhật và populate
        req.io.to(teamId).emit(eventName, updatedMember);
        
        console.log(`✅ [SOCKET - OLD FUNCTION] Event emitted successfully to room '${teamId}'`);
    } else {
        console.error('❌ [SOCKET - OLD FUNCTION] req.io is not available! Socket event will not be emitted.');
    }
    // =====================================================================
    // ===== KẾT THÚC ĐOẠN CODE SOCKET.IO CẦN THÊM VÀO  ========================
    // =====================================================================

    res.json({
      message: 'Cập nhật vai trò thành công',
      member: updatedMember
    });

  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa thành viên khỏi nhóm
exports.removeMember = async (req, res) => {
  try {
    const { id } = req.params; // ID của team member
    const currentUserId = req.user.userId || req.user.id; // Thay đổi để hỗ trợ cả 2 format

    console.log('🔍 [DEBUG] Remove member request:', {
      memberId: id,
      currentUserId,
      userObject: req.user
    });

    const member = await TeamMember.findById(id).populate('user_id', 'full_name email avatar_url');
    if (!member) {
      console.log('❌ [DEBUG] Member not found:', id);
      return res.status(404).json({ message: 'Không tìm thấy thành viên' });
    }    console.log('🔍 [DEBUG] Target member found:', {
      memberId: member._id,
      userId: member.user_id._id,
      userName: member.user_id.full_name || 'Unknown User',
      role: member.role,
      teamId: member.team_id,
      isActive: member.is_active    });

    // Kiểm tra quyền
    const currentMember = await TeamMember.findOne({
      team_id: member.team_id,
      user_id: currentUserId,
      is_active: true
    }).populate('user_id', 'full_name email avatar_url');

    if (!currentMember) {
      console.log('❌ [DEBUG] Current user not found in team:', {
        teamId: member.team_id,
        currentUserId
      });
      return res.status(403).json({ message: 'Bạn không có quyền trong nhóm này' });
    }    console.log('🔍 [DEBUG] Current member found:', {
      memberId: currentMember._id,
      userId: currentMember.user_id._id,
      userName: currentMember.user_id.full_name || 'Unknown User',
      role: currentMember.role,
      isActive: currentMember.is_active
    });

    // Quy tắc phân quyền với logging chi tiết
    let canDelete = false;
    let reason = '';

    if (currentMember.role === 'Admin') {
      // Admin không thể tự xóa mình
      if (member.user_id._id.toString() === currentUserId.toString()) {
        canDelete = false;
        reason = 'Admin không thể tự xóa khỏi nhóm';
      } else {
        canDelete = true;
        reason = 'Admin có quyền xóa thành viên khác';
      }
    } else if (currentMember.role === 'Editor') {
      // Editor chỉ có thể xóa Member
      if (member.role === 'Member') {
        canDelete = true;
        reason = 'Editor có quyền xóa Member';
      } else {
        canDelete = false;
        reason = 'Editor không thể xóa Admin hoặc Editor khác';
      }
    } else {
      canDelete = false;
      reason = 'Member không có quyền xóa thành viên';
    }

    console.log('🔍 [DEBUG] Permission check result:', {
      currentRole: currentMember.role,
      targetRole: member.role,
      isSelfDelete: member.user_id._id.toString() === currentUserId.toString(),
      canDelete,
      reason
    });

    if (!canDelete) {
      return res.status(403).json({ message: reason });
    }

    // Thực hiện xóa (soft delete)
    member.is_active = false;
    await member.save();    console.log('✅ [DEBUG] Member removed successfully:', {
      memberId: member._id,
      userName: member.user_id.full_name || 'Unknown User',
      removedBy: currentMember.user_id.full_name || 'Unknown User'
    });

    res.json({ 
      message: 'Xóa thành viên thành công',      removedMember: {
        id: member._id,
        userId: member.user_id._id,
        name: member.user_id.full_name || 'Unknown User',
        role: member.role
      }
    });

  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tìm kiếm user để thêm vào nhóm
exports.searchUsersToAdd = async (req, res) => {
  try {
    const { team_id, search = '', page = 1, limit = 10 } = req.query;
    const currentUserId = req.user.userId; // Thay đổi ở đây

    // Kiểm tra quyền (Admin hoặc Editor)
    const currentMember = await TeamMember.findOne({
      team_id,
      user_id: currentUserId,
      role: { $in: ['Admin', 'Editor'] },
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm thành viên' });
    }

    // Lấy danh sách user đã là thành viên
    // CHỈ loại trừ user đã là thành viên nhóm, KHÔNG loại trừ user đã là personal member!
    const existingMembers = await TeamMember.find({ 
      team_id, 
      is_active: true 
    }).select('user_id');
    const excludeUserIds = existingMembers.map(m => m.user_id);

    // Tìm kiếm user chưa là thành viên
    // Include users with either `is_active` (new field) or `isActive` (legacy field)
    const conditions = { _id: { $nin: excludeUserIds } };
    // Only active users (soft-delete support): check both possible fields
    const activeFilter = { $or: [ { is_active: true }, { isActive: true } ] };
    // Combine base and active filters
    conditions.$and = [ activeFilter ];

    // Add search regex if provided
    if (search) {
      conditions.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { full_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const skip = (page - 1) * limit;
      const users = await User.find(conditions)
      .select('full_name email avatar_url')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ full_name: 1 });

    const total = await User.countDocuments(conditions);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ==== NEW METHODS FOR PROPER URL STRUCTURE ====

// Lấy danh sách thành viên của team - GET /api/teams/:teamId/members
exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    console.log('🔍 [DEBUG] Get team members request:', {
      teamId,
      currentUserId,
      userObject: req.user
    });

    // Kiểm tra team có tồn tại
    const team = await Team.findOne({ _id: teamId, is_deleted: false });
    if (!team) {
      console.log('❌ [DEBUG] Team not found:', teamId);
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Kiểm tra quyền truy cập (user phải là thành viên của team)
    const currentMember = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      is_active: true
    });

    if (!currentMember) {
      console.log('❌ [DEBUG] User not a member of team:', {
        teamId,
        currentUserId
      });
      return res.status(403).json({ message: 'Bạn không có quyền xem danh sách thành viên của nhóm này' });
    }    // Lấy danh sách thành viên - chỉ populate user_id để tối ưu hiệu năng
    const members = await TeamMember.find({
      team_id: teamId,
      is_active: true
    })
    .populate('user_id', 'full_name email avatar_url')
    .sort({ created_at: -1 });    console.log('✅ [DEBUG] Found team members:', {
      teamId,
      memberCount: members.length,
      members: members.map(m => ({
        id: m._id,
        userId: m.user_id._id,
        userName: m.user_id.full_name || 'Unknown User',
        role: m.role
      }))
    });

    res.json({
      message: 'Lấy danh sách thành viên thành công',
      team: {
        id: team._id,
        name: team.team_name,
        description: team.description
      },
      members: members.map(member => ({
        id: member._id,        user: {
          id: member.user_id._id,
          full_name: member.user_id.full_name || 'Unknown User',
          email: member.user_id.email,
          avatar: member.user_id.avatar_url
        },
        role: member.role,
        joined_at: member.created_at,
        is_active: member.is_active
      })),
      total: members.length
    });

  } catch (error) {
    console.error('Error getting team members:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm thành viên vào team (với URL pattern mới)
exports.addMemberToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { user_id, role = 'Member' } = req.body;
    const currentUserId = req.user.userId || req.user.id;

    console.log('🔍 [DEBUG] Add member to team request:', {
      teamId,
      user_id,
      role,
      currentUserId
    });

    // Kiểm tra quyền (Admin hoặc Editor)
    const currentMember = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      role: { $in: ['Admin', 'Editor'] },
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm thành viên vào nhóm này' });
    }

    // Kiểm tra team có tồn tại
    const team = await Team.findOne({ _id: teamId, is_deleted: false });
    if (!team) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Kiểm tra user có tồn tại
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra user đã là thành viên chưa
    const existingMember = await TeamMember.findOne({ team_id: teamId, user_id });
    if (existingMember) {
      if (existingMember.is_active) {
        return res.status(400).json({ message: 'Người dùng đã là thành viên của nhóm' });
      } else {
        // Kích hoạt lại thành viên
        existingMember.is_active = true;
        existingMember.role = role;
        await existingMember.save();        
        const memberWithUser = await TeamMember.findById(existingMember._id)
          .populate('user_id', 'full_name email avatar_url');
          
        return res.json({
          message: 'Thêm thành viên thành công',
          member: memberWithUser
        });
      }
    }

    // Tạo thành viên mới
    const newMember = new TeamMember({
      team_id: teamId,
      user_id,
      role
    });

    await newMember.save();    const memberWithUser = await TeamMember.findById(newMember._id)
      .populate('user_id', 'full_name email avatar_url');

    console.log('✅ [DEBUG] Member added successfully:', {
      memberId: newMember._id,
      userId: user_id,
      role,
      teamId
    });

    res.status(201).json({
      message: 'Thêm thành viên thành công',
      member: memberWithUser
    });

  } catch (error) {
    console.error('Error adding member to team:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Thành viên đã tồn tại trong nhóm' });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật vai trò thành viên (với URL pattern mới)
exports.updateTeamMemberRole = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.userId || req.user.id;

    console.log('🔍 [DEBUG] Update team member role request:', {
      teamId,
      memberId,
      role,
      currentUserId
    });    // Tìm thành viên cần cập nhật
    const member = await TeamMember.findOne({
      _id: memberId,
      team_id: teamId,
      is_active: true
    }).populate('user_id', 'full_name email avatar_url');

    if (!member) {
      return res.status(404).json({ message: 'Không tìm thấy thành viên trong nhóm này' });
    }

    // Kiểm tra quyền
    const currentMember = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền trong nhóm này' });
    }

    // Quy tắc phân quyền
    if (currentMember.role === 'Admin') {
      // Admin có thể sửa tất cả, trừ chính mình
      if (member.user_id._id.toString() === currentUserId.toString()) {
        return res.status(400).json({ message: 'Không thể tự sửa vai trò của chính mình' });
      }
    } else if (currentMember.role === 'Editor') {
      // Editor chỉ có thể sửa Member, không sửa Admin/Editor
      if (member.role !== 'Member') {
        return res.status(403).json({ message: 'Bạn không có quyền sửa vai trò này' });
      }
      if (role === 'Admin') {
        return res.status(403).json({ message: 'Bạn không có quyền gán vai trò Admin' });
      }
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền sửa vai trò thành viên' });
    }

    // Cập nhật vai trò
    member.role = role;
    await member.save();

    // =================================================================
    // ===== BẮT ĐẦU ĐOẠN CODE ĐỒNG BỘ HÓA VAI TRÒ (THÊM VÀO ĐÂY) =====
    // =================================================================
    try {
        console.log(`[SYNC] Bắt đầu đồng bộ vai trò cho user: ${member.user_id._id} trong team: ${member.team_id}`);
        
        // 1. Tìm tất cả các dự án thuộc về team này
        const projectsInTeam = await Project.find({ team_id: member.team_id, is_deleted: false });

        if (projectsInTeam.length > 0) {
            const projectIds = projectsInTeam.map(p => p._id);
            const newProjectRole = mapTeamRoleToProjectRole(member.role);

            console.log(`[SYNC] Team có ${projectsInTeam.length} dự án. Đang cập nhật vai trò thành "${newProjectRole}".`);

            // 2. Cập nhật vai trò của user này trong tất cả các ProjectMember tương ứng
            const updateResult = await ProjectMember.updateMany(
                { 
                    project_id: { $in: projectIds }, 
                    user_id: member.user_id._id 
                },
                { 
                    $set: { role_in_project: newProjectRole } 
                }
            );

            console.log(`[SYNC] Đã cập nhật ${updateResult.modifiedCount} bản ghi ProjectMember.`);
        } else {
            console.log(`[SYNC] Team không có dự án nào để đồng bộ.`);
        }

    } catch (syncError) {
        // Ghi lại lỗi đồng bộ nhưng không làm request chính thất bại
        console.error('LỖI ĐỒNG BỘ VAI TRÒ:', syncError);
    }
    // =================================================================
    // ===== KẾT THÚC ĐOẠN CODE ĐỒNG BỘ HÓA VAI TRÒ                  =====
    // =================================================================

    const updatedMember = await TeamMember.findById(member._id)
      .populate('user_id', 'full_name email avatar_url');    console.log('✅ [DEBUG] Member role updated successfully:', {
      memberId,
      oldRole: member.role,
      newRole: role,
      userName: member.user_id.full_name || 'Unknown User'
    });

    // =====================================================================
    // ===== BẮT ĐẦU ĐOẠN CODE SOCKET.IO CẦN THÊM VÀO ========================
    // =====================================================================
    console.log('🔍 [SOCKET DEBUG] Checking req.io availability:', {
      reqIoExists: !!req.io,
      reqIoType: typeof req.io,
      appSocketio: !!req.app.get('socketio'),
      appSocketioType: typeof req.app.get('socketio')
    });

    if (req.io) {
        // Lấy teamId từ chính bản ghi member vừa được cập nhật
        const teamId = updatedMember.team_id.toString();

        // Tên sự kiện để cho frontend lắng nghe
        const eventName = 'team:member_updated';

        console.log(`✅ [SOCKET] req.io is available! Emitting event '${eventName}' to room '${teamId}'`);
        console.log(`🔍 [SOCKET] Updated member data:`, {
          memberId: updatedMember._id,
          userId: updatedMember.user_id._id,
          userName: updatedMember.user_id.full_name,
          role: updatedMember.role,
          teamId: updatedMember.team_id
        });

        // Gửi sự kiện đến tất cả client trong room của team đó
        // Payload là toàn bộ thông tin của member đã được cập nhật và populate
        req.io.to(teamId).emit(eventName, updatedMember);
        
        console.log(`✅ [SOCKET] Event emitted successfully to room '${teamId}'`);
    } else {
        console.error('❌ [SOCKET] req.io is not available! Socket event will not be emitted.');
        console.error('🔍 [SOCKET] This means the Socket.IO middleware is not working properly.');
    }
    // =====================================================================
    // ===== KẾT THÚC ĐOẠN CODE SOCKET.IO CẦN THÊM VÀO  ========================
    // =====================================================================

    res.json({
      message: 'Cập nhật vai trò thành công',
      member: updatedMember
    });

  } catch (error) {
    console.error('Error updating team member role:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa thành viên khỏi team (với URL pattern mới)
exports.removeMemberFromTeam = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    console.log('🔍 [DEBUG] Remove member from team request:', {
      teamId,
      memberId,
      currentUserId
    });    // Tìm thành viên cần xóa
    const member = await TeamMember.findOne({
      _id: memberId,
      team_id: teamId,
      is_active: true
    }).populate('user_id', 'full_name email avatar_url');

    if (!member) {
      return res.status(404).json({ message: 'Không tìm thấy thành viên trong nhóm này' });
    }

    // Kiểm tra quyền
    const currentMember = await TeamMember.findOne({
      team_id: teamId,
      user_id: currentUserId,
      is_active: true
    });

    if (!currentMember) {
      return res.status(403).json({ message: 'Bạn không có quyền trong nhóm này' });
    }

    // Quy tắc phân quyền
    let canDelete = false;

    if (currentMember.role === 'Admin') {
      // Admin không thể tự xóa mình
      if (member.user_id._id.toString() === currentUserId.toString()) {
        return res.status(400).json({ message: 'Admin không thể tự xóa khỏi nhóm' });
      }
      canDelete = true;
    } else if (currentMember.role === 'Editor') {
      // Editor chỉ có thể xóa Member
      if (member.role === 'Member') {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa thành viên này' });
    }

    // Xóa thành viên (soft delete)
    member.is_active = false;
    await member.save();    console.log('✅ [DEBUG] Member removed successfully:', {
      memberId,
      userName: member.user_id.full_name || 'Unknown User',
      role: member.role
    });

    res.json({
      message: 'Xóa thành viên thành công',
      removedMember: {
        id: member._id,
        user: {
          id: member.user_id._id,
          full_name: member.user_id.full_name || 'Unknown User',
          email: member.user_id.email
        },
        role: member.role
      }
    });

  } catch (error) {
    console.error('Error removing member from team:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};