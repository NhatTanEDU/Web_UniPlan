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
      console.log('🔍 DEBUG multer fileFilter - Original filename:', file.originalname);
      console.log('🔍 DEBUG multer fileFilter - Original filename (hex):', Buffer.from(file.originalname, 'utf8').toString('hex'));

      // Fix encoding cho filename - Thử nhiều cách khác nhau
      try {
        // Cách 1: Kiểm tra xem có phải là encoding issue không
        const hasEncodingIssue = file.originalname.includes('Ã¡') || file.originalname.includes('Ã ') || file.originalname.includes('Ã©') || file.originalname.includes('Ã­') || file.originalname.includes('Ã³') || file.originalname.includes('Ãº') || file.originalname.includes('Ä\\x90') || file.originalname.includes('á»');

        if (hasEncodingIssue) {
          console.log('🔍 DEBUG multer fileFilter - Detected encoding issue, fixing...');
          file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
          console.log('🔍 DEBUG multer fileFilter - Fixed filename:', file.originalname);
        } else {
          console.log('🔍 DEBUG multer fileFilter - Filename appears correct');
        }
      } catch (error) {
        console.log('⚠️ Could not fix filename encoding:', file.originalname, error.message);
      }

        // Kiểm tra loại file được phép
        const allowedTypes = [
            'image/jpeg',
            'image/png', 
            'image/gif',
          'image/webp',
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

// GET /api/documents/file/:fileId - Lấy file từ MongoDB
router.get(
  '/file/:fileId',
  documentController.getFile
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
