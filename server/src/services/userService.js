const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');

class UserService {
  /**
   * Lấy danh sách người dùng trong hệ thống (dành cho Admin)
   */
  async getAllUsers(filters = {}) {
    let sql = `
      SELECT u.id, u.student_code, u.email, u.full_name, u.role, u.faculty_id,
             u.class_name, u.academic_year, u.is_active, u.created_at,
             f.name as faculty_name, f.code as faculty_code
      FROM users u
      LEFT JOIN faculties f ON u.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.role) {
      sql += ` AND u.role = ?`;
      params.push(filters.role);
    }
    if (filters.facultyId) {
      sql += ` AND u.faculty_id = ?`;
      params.push(filters.facultyId);
    }
    if (filters.search) {
      sql += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.student_code LIKE ? OR u.class_name LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ` ORDER BY u.role ASC, u.id DESC`;

    return db.query(sql, params);
  }

  /**
   * Lấy chi tiết một người dùng
   */
  async getUserById(userId) {
    const user = db.get(`
      SELECT u.id, u.student_code, u.email, u.full_name, u.role, u.faculty_id,
             u.class_name, u.academic_year, u.is_active, u.created_at,
             f.name as faculty_name, f.code as faculty_code
      FROM users u
      LEFT JOIN faculties f ON u.faculty_id = f.id
      WHERE u.id = ?
    `, [userId]);

    if (!user) {
      throw { statusCode: 404, message: 'Không tìm thấy người dùng.' };
    }

    return user;
  }

  /**
   * Tạo tài khoản mới
   */
  async createUser(data, adminUser) {
    const { student_code, email, password, full_name, role, faculty_id, class_name, academic_year } = data;

    if (!email || !password || !full_name || !role) {
      throw { statusCode: 400, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (Email, Mật khẩu, Họ tên, Vai trò).' };
    }

    // Kiểm tra trùng email
    const existingEmail = db.get('SELECT id FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    if (existingEmail) {
      throw { statusCode: 400, message: 'Email này đã tồn tại trong hệ thống.' };
    }

    // Kiểm tra trùng mã sinh viên nếu có
    if (student_code && student_code.trim()) {
      const existingCode = db.get('SELECT id FROM users WHERE student_code = ?', [student_code.trim()]);
      if (existingCode) {
        throw { statusCode: 400, message: 'Mã số sinh viên này đã được sử dụng.' };
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const res = db.run(`
      INSERT INTO users (student_code, email, password_hash, full_name, role, faculty_id, class_name, academic_year, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      student_code ? student_code.trim() : null,
      email.trim().toLowerCase(),
      passwordHash,
      full_name.trim(),
      role,
      faculty_id || null,
      class_name ? class_name.trim() : null,
      academic_year ? academic_year.trim() : null
    ]);

    const newUserId = res.lastInsertRowid;
    logAction(adminUser.id, 'CREATE_USER', 'USER', newUserId, `Tạo tài khoản: ${email} (${role})`);

    return this.getUserById(newUserId);
  }

  /**
   * Cập nhật thông tin tài khoản
   */
  async updateUser(userId, data, adminUser) {
    const user = db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw { statusCode: 404, message: 'Không tìm thấy người dùng.' };
    }

    const { student_code, email, full_name, role, faculty_id, class_name, academic_year, is_active } = data;

    // Kiểm tra trùng email nếu thay đổi
    if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const existing = db.get('SELECT id FROM users WHERE LOWER(email) = ? AND id != ?', [email.trim().toLowerCase(), userId]);
      if (existing) {
        throw { statusCode: 400, message: 'Email đã được sử dụng bởi tài khoản khác.' };
      }
    }

    db.run(`
      UPDATE users
      SET student_code = ?, email = ?, full_name = ?, role = ?, faculty_id = ?, 
          class_name = ?, academic_year = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      student_code !== undefined ? (student_code ? student_code.trim() : null) : user.student_code,
      email !== undefined ? email.trim().toLowerCase() : user.email,
      full_name !== undefined ? full_name.trim() : user.full_name,
      role !== undefined ? role : user.role,
      faculty_id !== undefined ? faculty_id : user.faculty_id,
      class_name !== undefined ? (class_name ? class_name.trim() : null) : user.class_name,
      academic_year !== undefined ? (academic_year ? academic_year.trim() : null) : user.academic_year,
      is_active !== undefined ? (is_active ? 1 : 0) : user.is_active,
      userId
    ]);

    logAction(adminUser.id, 'UPDATE_USER', 'USER', userId, `Cập nhật thông tin tài khoản ID ${userId}`);
    return this.getUserById(userId);
  }

  /**
   * Đặt lại mật khẩu tài khoản
   */
  async resetPassword(userId, newPassword, adminUser) {
    if (!newPassword || newPassword.length < 6) {
      throw { statusCode: 400, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, userId]);

    logAction(adminUser.id, 'RESET_PASSWORD', 'USER', userId, `Admin đặt lại mật khẩu cho tài khoản ID ${userId}`);
    return { message: 'Đã đặt lại mật khẩu thành công!' };
  }

  /**
   * Bật / Khóa tài khoản
   */
  async toggleUserStatus(userId, adminUser) {
    if (Number(userId) === Number(adminUser.id)) {
      throw { statusCode: 400, message: 'Không thể tự khóa tài khoản của chính mình.' };
    }

    const user = db.get('SELECT is_active FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }

    const newStatus = user.is_active ? 0 : 1;
    db.run('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, userId]);

    logAction(adminUser.id, 'TOGGLE_USER_STATUS', 'USER', userId, `Đổi trạng thái hoạt động thành: ${newStatus ? 'Hoạt động' : 'Tạm khóa'}`);
    return { message: `Đã ${newStatus ? 'mở khóa' : 'tạm khóa'} tài khoản thành công!` };
  }

  /**
   * Xóa tài khoản
   */
  async deleteUser(userId, adminUser) {
    if (Number(userId) === Number(adminUser.id)) {
      throw { statusCode: 400, message: 'Không thể xóa tài khoản của chính mình.' };
    }

    const user = db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }

    db.run('DELETE FROM users WHERE id = ?', [userId]);
    logAction(adminUser.id, 'DELETE_USER', 'USER', userId, `Xóa tài khoản: ${user.email}`);

    return { message: 'Đã xóa tài khoản thành công!' };
  }

  /**
   * Lấy danh sách Nhật ký hoạt động hệ thống (Audit logs)
   */
  async getAuditLogs(filters = {}) {
    let sql = `
      SELECT al.*, u.full_name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.action) {
      sql += ` AND al.action = ?`;
      params.push(filters.action);
    }
    if (filters.search) {
      sql += ` AND (al.details LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT 200`;

    return db.query(sql, params);
  }
}

module.exports = new UserService();
