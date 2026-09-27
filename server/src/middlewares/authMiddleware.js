const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../config/jwt');

/**
 * Middleware xác thực JWT token từ Header (Authorization: Bearer <token>)
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.'
      });
    }

    // Đối chiếu với CSDL để tài khoản bị khóa / bị xóa / đổi vai trò mất hiệu lực ngay lập tức
    const dbUser = db.get('SELECT role, is_active FROM users WHERE id = ?', [user.id]);
    if (!dbUser || !dbUser.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa. Vui lòng đăng nhập lại!'
      });
    }

    req.user = { ...user, role: dbUser.role };
    next();
  });
}

/**
 * Middleware phân quyền theo vai trò (Role-Based Access Control)
 * @param {Array<string>} roles - Danh sách vai trò được phép truy cập (vd: ['ADMIN', 'STAFF'])
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện hành động này. Yêu cầu vai trò: ${roles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
