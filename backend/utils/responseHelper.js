// Backend Response Helper Utility
// Standardizes API responses across all controllers

/**
 * Standard success response format
 * @param {*} data - Response data
 * @param {string} message - Success message in Vietnamese
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Formatted response object
 */
const successResponse = (data = null, message = "Thành công", statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Standard error response format
 * @param {string} message - Error message in Vietnamese
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errors - Detailed error information
 * @returns {Object} Formatted error response object
 */
const errorResponse = (message = "Có lỗi xảy ra", statusCode = 500, errors = null) => {
  return {
    success: false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString()
  };
};

/**
 * Pagination response format
 * @param {Array} data - Array of items
 * @param {number} total - Total count of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 * @returns {Object} Formatted pagination response
 */
const paginationResponse = (data, total, page, limit, message = "Lấy dữ liệu thành công") => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    success: true,
    statusCode: 200,
    message,
    data,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Validation error response
 * @param {Array} validationErrors - Array of validation errors
 * @returns {Object} Formatted validation error response
 */
const validationErrorResponse = (validationErrors) => {
  // Ensure validationErrors is an array
  const errors = Array.isArray(validationErrors) ? validationErrors : [validationErrors];
  
  return errorResponse(
    "Dữ liệu không hợp lệ",
    400,
    errors.map(error => ({
      field: error.path || error.field,
      message: error.message || error.msg,
      value: error.value
    }))
  );
};

/**
 * Not found response
 * @param {string} resource - Resource name in Vietnamese
 * @returns {Object} Formatted not found response
 */
const notFoundResponse = (resource = "Tài nguyên") => {
  return errorResponse(`${resource} không tìm thấy`, 404);
};

/**
 * Unauthorized response
 * @param {string} message - Custom message
 * @returns {Object} Formatted unauthorized response
 */
const unauthorizedResponse = (message = "Không có quyền truy cập") => {
  return errorResponse(message, 401);
};

/**
 * Forbidden response
 * @param {string} message - Custom message
 * @returns {Object} Formatted forbidden response
 */
const forbiddenResponse = (message = "Bị cấm truy cập") => {
  return errorResponse(message, 403);
};

/**
 * Send standardized response
 * @param {Object} res - Express response object
 * @param {Object} responseData - Response data object
 */
const sendResponse = (res, responseData) => {
  res.status(responseData.statusCode).json(responseData);
};

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  sendResponse
};
