/**
 * Middleware xử lý lỗi tập trung cho toàn bộ ứng dụng Express
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Lỗi hệ thống:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau.';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = { errorHandler };
