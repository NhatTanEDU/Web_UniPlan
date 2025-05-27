const TeamMember = require('../models/teamMember.model');
const Team = require('../models/team.model');
const User = require('../models/user.model');

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
          .populate('user_id', 'full_name email avatar');
          
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

    await newMember.save();

    const memberWithUser = await TeamMember.findById(newMember._id)
      .populate('user_id', 'full_name email avatar');

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

    const updatedMember = await TeamMember.findById(member._id)
      .populate('user_id', 'full_name email avatar');

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
      // Admin không thể tự xóa mình
      if (member.user_id.toString() === currentUserId.toString()) {
        return res.status(400).json({ message: 'Admin không thể tự xóa khỏi nhóm' });
      }
    } else if (currentMember.role === 'Editor') {
      // Editor chỉ có thể xóa Member
      if (member.role !== 'Member') {
        return res.status(403).json({ message: 'Bạn không có quyền xóa thành viên này' });
      }
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền xóa thành viên' });
    }

    member.is_active = false;
    await member.save();

    res.json({ message: 'Xóa thành viên thành công' });

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
    const existingMembers = await TeamMember.find({ 
      team_id, 
      is_active: true 
    }).select('user_id');
    
    const excludeUserIds = existingMembers.map(m => m.user_id);

    // Tìm kiếm user chưa là thành viên
    const conditions = {
      _id: { $nin: excludeUserIds },
      is_active: true
    };

    if (search) {
      conditions.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(conditions)
      .select('full_name email avatar')
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