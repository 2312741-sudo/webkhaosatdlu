const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../config/jwt');
const { logAction } = require('../utils/auditLogger');

class AuthService {
  /**
   * Tự động nhận diện thông tin sinh viên DLU từ Email hoặc Mã SV
   * Ví dụ: 2312741@dlu.edu.vn -> MSSV: 2312741, Khóa: K47, Lớp: CTK47
   */
  parseDluStudentInfo(identifier) {
    const clean = identifier.trim().toLowerCase();
    let studentCode = null;

    if (clean.endsWith('@dlu.edu.vn')) {
      const prefix = clean.split('@')[0];
      if (/^\d{7}$/.test(prefix) || /^\d{6,8}$/.test(prefix)) {
        studentCode = prefix;
      }
    } else if (/^\d{7}$/.test(clean) || /^\d{6,8}$/.test(clean)) {
      studentCode = clean;
    }

    if (studentCode) {
      const yearPrefix = parseInt(studentCode.substring(0, 2), 10);
      // DLU: 21 -> K45 (21+24), 22 -> K46 (22+24), 23 -> K47 (23+24), 24 -> K48 (24+24)
      let academicYear = 'K47';
      let className = 'CTK47';

      if (!isNaN(yearPrefix)) {
        const kNumber = yearPrefix + 24;
        academicYear = `K${kNumber}`;
        className = `CTK${kNumber}`;
      }

      return {
        isStudent: true,
        studentCode,
        email: `${studentCode}@dlu.edu.vn`,
        academicYear,
        className
      };
    }

    return {
      isStudent: false,
      email: clean
    };
  }

  /**
   * Chế độ đăng nhập Google "giả lập" (chỉ nhập email) — CHỈ dùng khi demo trên máy cục bộ.
   * Phải bật rõ ràng ALLOW_DEV_GOOGLE_LOGIN=true và không chạy ở production.
   */
  isDevGoogleLoginAllowed() {
    return process.env.ALLOW_DEV_GOOGLE_LOGIN === 'true' && process.env.NODE_ENV !== 'production';
  }

  /**
   * Xác minh token do Google cấp bằng endpoint tokeninfo chính thức của Google
   * (Google kiểm tra chữ ký & thời hạn), sau đó kiểm tra token được cấp cho đúng Client ID của hệ thống.
   * @returns {{ email: string, name: string }}
   */
  async verifyGoogleToken({ idToken, accessToken }) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw { statusCode: 503, message: 'Máy chủ chưa cấu hình GOOGLE_CLIENT_ID nên chưa hỗ trợ đăng nhập Google.' };
    }

    const invalid = { statusCode: 401, message: 'Token Google không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' };
    const tokenParam = idToken
      ? `id_token=${encodeURIComponent(idToken)}`
      : `access_token=${encodeURIComponent(accessToken)}`;

    let info;
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?${tokenParam}`);
      if (!res.ok) throw invalid;
      info = await res.json();
    } catch (e) {
      if (e === invalid) throw invalid;
      throw { statusCode: 502, message: 'Không thể kết nối tới Google để xác minh đăng nhập.' };
    }

    if (info.aud !== clientId && info.azp !== clientId) throw invalid;
    if (idToken && !['accounts.google.com', 'https://accounts.google.com'].includes(info.iss)) throw invalid;
    if (!info.email || String(info.email_verified) !== 'true') {
      throw { statusCode: 401, message: 'Email Google chưa được xác minh.' };
    }

    let name = info.name || '';
    if (!name && accessToken) {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.ok) name = (await res.json()).name || '';
      } catch (e) {
        // Không lấy được tên thì dùng tên mặc định
      }
    }

    return { email: info.email, name };
  }

  /**
   * Đăng nhập / Xác thực tài khoản Google (@dlu.edu.vn)
   * Email chỉ được tin cậy khi lấy từ token đã được Google xác minh.
   */
  async loginWithDluGoogle({ idToken, accessToken, email, fullName = '' } = {}) {
    let targetEmail;
    let targetName = fullName;
    let isDevLogin = false;

    if (idToken || accessToken) {
      const verified = await this.verifyGoogleToken({ idToken, accessToken });
      targetEmail = verified.email;
      targetName = verified.name || fullName;
    } else if (this.isDevGoogleLoginAllowed()) {
      targetEmail = email;
      isDevLogin = true;
    } else {
      throw { statusCode: 401, message: 'Thiếu token xác thực từ Google. Vui lòng đăng nhập qua nút "Đăng nhập với Google DLU".' };
    }

    if (!targetEmail || typeof targetEmail !== 'string') {
      throw { statusCode: 400, message: 'Email Google không hợp lệ.' };
    }

    const cleanEmail = targetEmail.trim().toLowerCase();

    // KIỂM TRA BẮT BUỘC ĐUÔI @dlu.edu.vn
    if (!cleanEmail.endsWith('@dlu.edu.vn')) {
      throw { 
        statusCode: 400, 
        message: 'Từ chối truy cập! Hệ thống chỉ cho phép tài khoản Google Workspace chính thức của trường có đuôi @dlu.edu.vn.' 
      };
    }

    // Tìm người dùng trong database
    let user = db.get(`
      SELECT u.*, f.name as faculty_name, f.code as faculty_code
      FROM users u
      LEFT JOIN faculties f ON u.faculty_id = f.id
      WHERE LOWER(u.email) = ?
    `, [cleanEmail]);

    // Chế độ giả lập cục bộ chỉ được đăng nhập vào tài khoản SINH VIÊN, không bao giờ vào tài khoản Cán bộ / Admin
    if (isDevLogin && user && user.role !== 'STUDENT') {
      throw { statusCode: 403, message: 'Chế độ đăng nhập Google giả lập chỉ áp dụng cho tài khoản sinh viên.' };
    }

    // Nếu tài khoản chưa từng đăng nhập trước đó -> Tự động đăng ký (chỉ với email sinh viên)
    if (!user) {
      const dluInfo = this.parseDluStudentInfo(cleanEmail);

      // Tài khoản cán bộ có quyền tạo / phát hành khảo sát nên phải do Admin cấp, không tự đăng ký
      if (!dluInfo.isStudent) {
        throw { statusCode: 403, message: 'Tài khoản cán bộ chưa được cấp quyền truy cập. Vui lòng liên hệ Quản trị viên hệ thống.' };
      }

      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const displayName = targetName && targetName.trim()
        ? targetName.trim()
        : `Sinh viên ${dluInfo.studentCode}`;

      const res = db.run(`
        INSERT INTO users (student_code, email, password_hash, full_name, role, faculty_id, class_name, academic_year, is_active)
        VALUES (?, ?, ?, ?, 'STUDENT', 1, ?, ?, 1)
      `, [
        dluInfo.studentCode,
        cleanEmail,
        randomPassword,
        displayName,
        dluInfo.className,
        dluInfo.academicYear
      ]);

      user = db.get(`
        SELECT u.*, f.name as faculty_name, f.code as faculty_code
        FROM users u
        LEFT JOIN faculties f ON u.faculty_id = f.id
        WHERE u.id = ?
      `, [res.lastInsertRowid]);

      logAction(user.id, 'GOOGLE_SSO_AUTO_REGISTER', 'USER', user.id, `Tự động tạo tài khoản DLU qua Google: ${cleanEmail} (${displayName})`);
    } else {
      // Nếu đã có tài khoản và nhận được Tên đầy đủ từ Google Profile
      if (targetName && targetName.trim() && (user.full_name.startsWith('Sinh viên ') || !user.full_name)) {
        db.run('UPDATE users SET full_name = ? WHERE id = ?', [targetName.trim(), user.id]);
        user.full_name = targetName.trim();
      }
    }

    if (!user.is_active) {
      throw { statusCode: 403, message: 'Tài khoản DLU của bạn đang bị khóa.' };
    }

    logAction(user.id, 'GOOGLE_LOGIN_SUCCESS', 'USER', user.id, `Đăng nhập Google DLU thành công: ${cleanEmail}`);
    return this.generateAuthResponse(user);
  }

  /**
   * Đăng nhập thông thường (Email @dlu.edu.vn / MSSV + Mật khẩu)
   */
  async login(identifier, password, providedFullName = '') {
    if (!identifier || !password) {
      throw { statusCode: 400, message: 'Vui lòng nhập tài khoản/email trường DLU và mật khẩu.' };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    
    // 1. Tìm người dùng trong database
    let user = db.get(`
      SELECT u.*, f.name as faculty_name, f.code as faculty_code
      FROM users u
      LEFT JOIN faculties f ON u.faculty_id = f.id
      WHERE LOWER(u.email) = ? OR u.student_code = ?
    `, [cleanIdentifier, identifier.trim()]);

    // 2. Kiểm tra mật khẩu. Không tự tạo tài khoản qua form mật khẩu (ai cũng có thể gõ một MSSV bất kỳ);
    //    sinh viên mới dùng "Đăng nhập với Google DLU" hoặc được Admin cấp tài khoản.
    const isPasswordValid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!isPasswordValid) {
      logAction(user ? user.id : null, 'LOGIN_FAILED', 'USER', user ? user.id : null, `Đăng nhập thất bại với tài khoản: ${cleanIdentifier}`);
      throw { statusCode: 401, message: 'Tài khoản DLU không tồn tại hoặc mật khẩu không chính xác.' };
    }

    if (!user.is_active) {
      throw { statusCode: 403, message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Văn phòng Khoa CNTT.' };
    }

    if (providedFullName && providedFullName.trim() && user.full_name.startsWith('Sinh viên ')) {
      db.run('UPDATE users SET full_name = ? WHERE id = ?', [providedFullName.trim(), user.id]);
      user.full_name = providedFullName.trim();
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Cập nhật thông tin cá nhân sinh viên (Họ tên, Lớp, Khóa)
   */
  async updateProfile(userId, { fullName, className, academicYear }) {
    if (!fullName || !fullName.trim()) {
      throw { statusCode: 400, message: 'Họ và tên không được để trống.' };
    }

    db.run(`
      UPDATE users 
      SET full_name = ?, class_name = COALESCE(?, class_name), academic_year = COALESCE(?, academic_year), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [fullName.trim(), className || null, academicYear || null, userId]);

    const updatedUser = await this.getMe(userId);
    logAction(userId, 'UPDATE_PROFILE', 'USER', userId, `Sinh viên cập nhật hồ sơ: ${fullName}`);

    return {
      success: true,
      message: 'Cập nhật thông tin sinh viên thành công!',
      user: updatedUser
    };
  }

  /**
   * Tạo JWT token và payload người dùng
   */
  generateAuthResponse(user) {
    const payload = {
      id: user.id,
      studentCode: user.student_code,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      facultyId: user.faculty_id || 1,
      facultyCode: user.faculty_code || 'CNTT',
      facultyName: user.faculty_name || 'Khoa Công nghệ Thông tin',
      className: user.class_name || (user.student_code ? `CTK${parseInt(user.student_code.substring(0, 2), 10) + 24}` : null),
      academicYear: user.academic_year || (user.student_code ? `K${parseInt(user.student_code.substring(0, 2), 10) + 24}` : null)
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d'
    });

    return {
      token,
      user: payload
    };
  }

  /**
   * Lấy thông tin cá nhân hiện tại
   */
  async getMe(userId) {
    const user = db.get(`
      SELECT u.id, u.student_code, u.email, u.full_name, u.role, u.faculty_id, 
             u.class_name, u.academic_year, u.is_active, u.created_at,
             f.name as faculty_name, f.code as faculty_code
      FROM users u
      LEFT JOIN faculties f ON u.faculty_id = f.id
      WHERE u.id = ?
    `, [userId]);

    if (!user) {
      throw { statusCode: 404, message: 'Không tìm thấy thông tin người dùng.' };
    }

    return {
      id: user.id,
      studentCode: user.student_code,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      facultyId: user.faculty_id || 1,
      facultyCode: user.faculty_code || 'CNTT',
      facultyName: user.faculty_name || 'Khoa Công nghệ Thông tin',
      className: user.class_name,
      academicYear: user.academic_year
    };
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(userId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw { statusCode: 400, message: 'Vui lòng điền mật khẩu cũ và mật khẩu mới.' };
    }

    if (newPassword.length < 6) {
      throw { statusCode: 400, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' };
    }

    const user = db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw { statusCode: 404, message: 'Người dùng không tồn tại.' };
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Mật khẩu hiện tại không đúng.' };
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, userId]);

    logAction(userId, 'CHANGE_PASSWORD', 'USER', userId, 'Người dùng đã thay đổi mật khẩu');

    return { message: 'Đổi mật khẩu thành công!' };
  }
}

module.exports = new AuthService();
