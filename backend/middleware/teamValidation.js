const { body, validationResult } = require('express-validator');
const responseHelper = require('../utils/responseHelper');

// Validation rules cho việc tạo team
const validateCreateTeam = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên nhóm không được để trống')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên nhóm phải có độ dài từ 2-100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được vượt quá 500 ký tự'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Màu sắc phải là mã hex hợp lệ (ví dụ: #FF0000)'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái công khai phải là true hoặc false'),
  
  body('maxMembers')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Số lượng thành viên tối đa phải từ 1-100')
];

// Validation rules cho việc cập nhật team
const validateUpdateTeam = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tên nhóm không được để trống')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên nhóm phải có độ dài từ 2-100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được vượt quá 500 ký tự'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Màu sắc phải là mã hex hợp lệ (ví dụ: #FF0000)'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái công khai phải là true hoặc false'),
  
  body('maxMembers')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Số lượng thành viên tối đa phải từ 1-100')
];

// Validation rules cho việc thêm thành viên
const validateAddMember = [
  body('userId')
    .notEmpty()
    .withMessage('ID người dùng không được để trống')
    .isMongoId()
    .withMessage('ID người dùng không hợp lệ'),
  
  body('role')
    .optional()
    .isIn(['member', 'admin', 'leader'])
    .withMessage('Vai trò phải là member, admin hoặc leader')
];

// Validation rules cho việc thêm nhiều thành viên
const validateAddMultipleMembers = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('Danh sách người dùng phải là mảng và không được rỗng'),
  
  body('userIds.*')
    .isMongoId()
    .withMessage('Tất cả ID người dùng phải hợp lệ'),
  
  body('role')
    .optional()
    .isIn(['member', 'admin', 'leader'])
    .withMessage('Vai trò phải là member, admin hoặc leader')
];

// Validation rules cho việc gán dự án
const validateAssignProject = [
  body('projectId')
    .notEmpty()
    .withMessage('ID dự án không được để trống')
    .isMongoId()
    .withMessage('ID dự án không hợp lệ'),
  
  body('role')
    .optional()
    .isIn(['viewer', 'contributor', 'manager'])
    .withMessage('Vai trò trong dự án phải là viewer, contributor hoặc manager')
];

// Validation rules cho tìm kiếm và lọc
const validateSearchAndFilter = [
  body('searchTerm')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Từ khóa tìm kiếm không được vượt quá 100 ký tự'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Bộ lọc công khai phải là true hoặc false'),
  
  body('memberCount')
    .optional()
    .isObject()
    .withMessage('Bộ lọc số lượng thành viên phải là object'),
  
  body('memberCount.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng thành viên tối thiểu phải >= 0'),
  
  body('memberCount.max')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Số lượng thành viên tối đa phải >= 1'),
  
  body('createdDateRange')
    .optional()
    .isObject()
    .withMessage('Bộ lọc ngày tạo phải là object'),
  
  body('createdDateRange.from')
    .optional()
    .isISO8601()
    .withMessage('Ngày bắt đầu phải có định dạng ISO8601'),
  
  body('createdDateRange.to')
    .optional()
    .isISO8601()
    .withMessage('Ngày kết thúc phải có định dạng ISO8601')
];

// Middleware xử lý lỗi validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    return responseHelper.validationErrorResponse(res, validationErrors);
  }
  
  next();
};

// Middleware kiểm tra quyền truy cập team
const checkTeamAccess = (allowedRoles = ['member', 'admin', 'leader']) => {
  return async (req, res, next) => {
    try {
      console.log('🔍 [MIDDLEWARE] checkTeamAccess called');
      const teamId = req.params.teamId;
      const userId = req.user.userId || req.user.id || req.user._id;
      
      console.log('🔍 [MIDDLEWARE] Team ID:', teamId, 'User ID:', userId);
      
      // Import TeamMember model
      const TeamMember = require('../models/teamMember.model');
      
      const membership = await TeamMember.findOne({
        team_id: teamId,
        user_id: userId
      });
      
      console.log('🔍 [MIDDLEWARE] Membership found:', !!membership);
      
      if (!membership) {
        console.log('❌ [MIDDLEWARE] No membership found');
        return responseHelper.forbiddenResponse(res, 'Bạn không có quyền truy cập nhóm này');
      }
      
      console.log('🔍 [MIDDLEWARE] User role:', membership.role);
      
      if (!allowedRoles.includes(membership.role.toLowerCase())) {
        console.log('❌ [MIDDLEWARE] Role not allowed:', membership.role, 'Allowed:', allowedRoles);
        return responseHelper.forbiddenResponse(res, 'Bạn không có đủ quyền để thực hiện hành động này');
      }
      
      req.userTeamRole = membership.role;
      console.log('✅ [MIDDLEWARE] Access granted, proceeding to controller');
      next();
    } catch (error) {
      console.error('Error checking team access:', error);
      return responseHelper.errorResponse(res, 'Lỗi kiểm tra quyền truy cập', 500);
    }
  };
};

// Middleware kiểm tra team leader
const checkTeamLeader = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.id;
    
    const TeamMember = require('../models/teamMember.model');
    
    const membership = await TeamMember.findOne({
      teamId: teamId,
      userId: userId,
      role: 'leader'
    });
    
    if (!membership) {
      return responseHelper.forbiddenResponse(res, 'Chỉ trưởng nhóm mới có thể thực hiện hành động này');
    }
    
    next();
  } catch (error) {
    console.error('Error checking team leader:', error);
    return responseHelper.errorResponse(res, 'Lỗi kiểm tra quyền trưởng nhóm', 500);
  }
};

// Middleware kiểm tra admin hoặc leader
const checkTeamAdminOrLeader = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.id;
    
    const TeamMember = require('../models/teamMember.model');
    
    const membership = await TeamMember.findOne({
      teamId: teamId,
      userId: userId,
      role: { $in: ['admin', 'leader'] }
    });
    
    if (!membership) {
      return responseHelper.forbiddenResponse(res, 'Chỉ quản trị viên hoặc trưởng nhóm mới có thể thực hiện hành động này');
    }
    
    req.userTeamRole = membership.role;
    next();
  } catch (error) {
    console.error('Error checking team admin/leader:', error);
    return responseHelper.errorResponse(res, 'Lỗi kiểm tra quyền quản trị', 500);
  }
};

module.exports = {
  validateCreateTeam,
  validateUpdateTeam,
  validateAddMember,
  validateAddMultipleMembers,
  validateAssignProject,
  validateSearchAndFilter,
  handleValidationErrors,
  checkTeamAccess,
  checkTeamLeader,
  checkTeamAdminOrLeader
};
