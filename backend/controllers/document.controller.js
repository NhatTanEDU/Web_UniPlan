// controllers/document.controller.js
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/document.model');

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY';
const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'uniplan-upload-file';

// Khởi tạo Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

        // 3. Tạo tên file duy nhất để tránh trùng lặp trên Supabase
        const fileExtension = req.file.originalname.split('.').pop();
        const newFileName = `${uuidv4()}.${fileExtension}`;
        const storagePath = `documents/${newFileName}`;

        console.log('🔍 DEBUG uploadDocument - Storage path:', storagePath);

        // 4. Upload file lên bucket của Supabase
        const { data, error: uploadError } = await supabase.storage
            .from(SUPABASE_BUCKET_NAME)
            .upload(storagePath, req.file.buffer, {
                contentType: req.file.mimetype,
            });

        if (uploadError) {
            console.error('❌ Lỗi upload lên Supabase:', uploadError);
            return res.status(500).json({ 
                success: false,
                message: 'Lỗi khi tải file lên dịch vụ lưu trữ.',
                error: uploadError.message 
            });
        }

        console.log('✅ Upload thành công lên Supabase:', data);

        // 5. Lấy URL công khai của file vừa upload
        const { data: { publicUrl } } = supabase.storage
            .from(SUPABASE_BUCKET_NAME)
            .getPublicUrl(storagePath);

        console.log('🔍 DEBUG uploadDocument - Public URL:', publicUrl);

        // 6. Lưu thông tin file vào MongoDB
        const newDocument = new Document({
            fileName: req.file.originalname,
            fileUrl: publicUrl,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            storagePath: storagePath,
            taskId: taskId || null,
            projectId: projectId || null,
            teamId: teamId || null,
            uploadedBy: userId,
        });

        const savedDocument = await newDocument.save();
        console.log('✅ Document saved to MongoDB:', savedDocument._id);

        // 7. Trả về thông tin file đã lưu cho client
        return res.status(201).json({
            success: true,
            message: 'Tải file lên thành công!',
            data: savedDocument,
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

        // Lấy documents với pagination
        const documents = await Document.find(filter)
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

        // Xóa file trên Supabase
        const { error: deleteError } = await supabase.storage
            .from(SUPABASE_BUCKET_NAME)
            .remove([document.storagePath]);

        if (deleteError) {
            console.error('❌ Lỗi xóa file trên Supabase:', deleteError);
            // Vẫn tiếp tục xóa record trong DB ngay cả khi xóa file thất bại
        } else {
            console.log('✅ Đã xóa file trên Supabase:', document.storagePath);
        }

        // Xóa record trong MongoDB
        await Document.findByIdAndDelete(id);

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