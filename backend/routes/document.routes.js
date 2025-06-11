// routes/document.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/document.controller');

// Import middleware auth
const authMiddleware = require('../middleware/auth');

// Cấu hình Multer để xử lý file trong bộ nhớ (không lưu tạm ra đĩa)
const storage = multer.memoryStorage();

// Giới hạn kích thước file (ví dụ: 10MB)
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Kiểm tra loại file được phép
        const allowedTypes = [
            'image/jpeg',
            'image/png', 
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Loại file không được hỗ trợ'), false);
        }
    }
});

// === ROUTES ===

// POST /api/documents/upload - Upload file mới
router.post(
    '/upload',
    authMiddleware, // Middleware để lấy thông tin req.user
    upload.single('fileDinhKem'), // 'fileDinhKem' là tên của field chứa file
    documentController.uploadDocument
);

// GET /api/documents - Lấy danh sách documents
router.get(
    '/',
    authMiddleware,
    documentController.getDocuments
);

// DELETE /api/documents/:id - Xóa document
router.delete(
    '/:id',
    authMiddleware,
    documentController.deleteDocument
);

// Middleware xử lý lỗi cho multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File quá lớn. Kích thước tối đa là 10MB'
            });
        }
    }
    
    if (error.message === 'Loại file không được hỗ trợ') {
        return res.status(400).json({
            success: false,
            message: 'Loại file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, PDF, DOC, DOCX, TXT'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý file',
        error: error.message
    });
});

module.exports = router;
