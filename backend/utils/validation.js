const Joi = require('joi');
// chỉnh sửa dự án
const updateProjectSchema = Joi.object({
  project_name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  status: Joi.string().valid('Active', 'Archived', 'Completed').optional(), // Cập nhật để khớp với schema
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  start_date: Joi.date().optional(), // Thêm validation cho start_date
  end_date: Joi.date().optional(),   // Thêm validation cho end_date
});  // Validation cho thêm thành viên
const addMemberSchema = Joi.object({
    user_id: Joi.string().required().messages({
      'string.empty': 'ID người dùng không được để trống',
    }),
    role_in_project: Joi.string().valid('Quản trị viên', 'Biên tập viên', 'Người xem').required().messages({
      'any.only': 'Vai trò phải là Quản trị viên, Biên tập viên hoặc Người xem',
    }),
  });
  
  // Validation cho chỉnh sửa vai trò
  const updateMemberRoleSchema = Joi.object({
    role_in_project: Joi.string().valid('Quản trị viên', 'Biên tập viên', 'Người xem').required().messages({
      'any.only': 'Vai trò phải là Quản trị viên, Biên tập viên hoặc Người xem',
    }),
  });
  
  module.exports = { updateProjectSchema, addMemberSchema, updateMemberRoleSchema };