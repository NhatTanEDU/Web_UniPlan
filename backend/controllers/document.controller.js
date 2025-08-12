// controllers/document.controller.js
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/document.model');

// Hàm xử lý upload file
exports.uploadDocument = async (req, res) => {
    try {
        console.log('🔍 DEBUG uploadDocument - Request received');
        console.log('🔍 DEBUG uploadDocument - File:', req.file);
        console.log('🔍 DEBUG uploadDocument - Body:', req.body);
        console.log('🔍 DEBUG uploadDocument - User:', req.user);

        // 1. Kiểm tra xem file đã được gửi lên chưa
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'Không có file nào được tải lên.' 
            });
        }

        // 2. Lấy thông tin ngữ cảnh từ body
        const { taskId, projectId, teamId } = req.body;
        const userId = req.user.userId; // Sử dụng userId từ auth middleware

        console.log('🔍 DEBUG uploadDocument - Context:', { taskId, projectId, teamId, userId });

      // 3. Lưu file trực tiếp vào MongoDB
        const newDocument = new Document({
          fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
          fileData: req.file.buffer, // Lưu binary data trực tiếp vào MongoDB
            taskId: taskId || null,
            projectId: projectId || null,
            teamId: teamId || null,
            uploadedBy: userId,
        });

      console.log('🔍 DEBUG uploadDocument - Saving to MongoDB...');
        const savedDocument = await newDocument.save();
        console.log('✅ Document saved to MongoDB:', savedDocument._id);

      // 4. Trả về thông tin file đã lưu cho client (không bao gồm fileData để giảm kích thước response)
      const responseData = {
        _id: savedDocument._id,
        fileName: savedDocument.fileName,
        fileType: savedDocument.fileType,
        fileSize: savedDocument.fileSize,
        taskId: savedDocument.taskId,
        projectId: savedDocument.projectId,
        teamId: savedDocument.teamId,
        uploadedBy: savedDocument.uploadedBy,
        createdAt: savedDocument.createdAt,
        updatedAt: savedDocument.updatedAt
      };

        return res.status(201).json({
            success: true,
            message: 'Tải file lên thành công!',
          data: responseData,
        });

    } catch (error) {
        console.error('❌ Lỗi trong quá trình upload:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Lỗi máy chủ không xác định.',
            error: error.message 
        });
    }
};

// Hàm lấy danh sách documents theo context
exports.getDocuments = async (req, res) => {
    try {
        const { taskId, projectId, teamId, page = 1, limit = 10 } = req.query;
        const userId = req.user.userId;

        console.log('🔍 DEBUG getDocuments - Query:', { taskId, projectId, teamId, page, limit });

        // Xây dựng filter
        let filter = {};
        
        // Only filter by userId if it's for personal documents
        // For team/project documents, don't filter by uploadedBy
        if (!teamId && !projectId && !taskId) {
            filter.uploadedBy = userId;
        }
        
        if (taskId) filter.taskId = taskId;
        if (projectId) filter.projectId = projectId;
        if (teamId) filter.teamId = teamId;

        const skip = (page - 1) * limit;

      // Lấy documents với pagination (exclude fileData để giảm kích thước response)
        const documents = await Document.find(filter)
          .select('-fileData') // Loại bỏ fileData khỏi kết quả
            .populate('uploadedBy', 'full_name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Đếm tổng số
        const total = await Document.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách tài liệu thành công',
            data: documents,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_items: total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách documents:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi lấy danh sách tài liệu',
            error: error.message
        });
    }
};

// Hàm xóa document
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        console.log('🔍 DEBUG deleteDocument - ID:', id, 'User:', userId);

        // Tìm document
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài liệu'
            });
        }

        // Check permission: user must be the uploader
        if (document.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa tài liệu này'
            });
        }

      // Xóa record trong MongoDB (file data sẽ được xóa cùng)
        await Document.findByIdAndDelete(id);
      console.log('✅ Đã xóa document và file data từ MongoDB');

        return res.status(200).json({
            success: true,
            message: 'Xóa tài liệu thành công'
        });

    } catch (error) {
        console.error('❌ Lỗi khi xóa document:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi xóa tài liệu',
            error: error.message
        });
    }
};

// Hàm lấy file từ MongoDB
exports.getFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    console.log('🔍 DEBUG getFile - FileId:', fileId);

    // 1. Tìm document trong database theo fileId
    const document = await Document.findById(fileId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }

    if (!document.fileData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu file'
      });
    }

    console.log('🔍 DEBUG getFile - Document found:', {
      id: document._id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize
    });

    // 2. Set headers và trả về file từ MongoDB
    res.set({
      'Content-Type': document.fileType,
      'Content-Disposition': `attachment; filename="${document.fileName}"`,
      'Content-Length': document.fileData.length
    });

    // 3. Trả về binary data
    res.send(document.fileData);

  } catch (error) {
    console.error('❌ Lỗi khi lấy file:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy file',
      error: error.message
    });
  }
};