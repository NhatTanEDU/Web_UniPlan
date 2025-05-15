const mongoose = require('mongoose');
const Notification = require('../models/notification.model.js');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId; // Sử dụng req.user.userId
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    const notifications = await Notification.find({ user_id: userId }).sort({ sent_at: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông báo', error: error.message });
  }
};

exports.createNotification = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
  
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ message: 'User ID not found' });
  
      const userName = req.user.email ? req.user.email.split('@')[0] : 'Unknown';
      const { project_id, type, content } = req.body;
      const io = req.app.get('server').io;
  
      if (project_id && !mongoose.Types.ObjectId.isValid(project_id)) {
        return res.status(400).json({ message: 'ID dự án không hợp lệ' });
      }
  
      let dynamicContent = content || '';
      switch (type) {
        case 'ProjectUpdated':
          dynamicContent = `[${userName}] đã cập nhật dự án thành công`;
          break;
        case 'MemberAdded':
          dynamicContent = `[${userName}] đã thêm thành viên mới`;
          break;
        case 'MemberRemoved':
          dynamicContent = `[${userName}] đã xóa thành viên`;
          break;
        case 'ProjectCreated': // Thêm case cho ProjectCreated
          dynamicContent = `[${userName}] đã tạo dự án mới`;
          break;
        default:
          dynamicContent = `[${userName}] thông báo: ${content || 'Thông báo chung'}`;
      }
  
      const notification = new Notification({
        user_id: userId,
        project_id: project_id ? new mongoose.Types.ObjectId(project_id) : undefined,
        type: type || 'Basic',
        content: dynamicContent,
      });
      await notification.save();
  
      io.to(userId).emit('newNotification', notification);
  
      res.status(201).json({ message: 'Tạo thông báo thành công', notification });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo thông báo', error: error.message });
    }
  };

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId; // Sử dụng req.user.userId
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID thông báo không hợp lệ' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo hoặc không có quyền' });
    }

    res.status(200).json({ message: 'Đánh dấu thông báo đã đọc', notification });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thông báo', error: error.message });
  }
};