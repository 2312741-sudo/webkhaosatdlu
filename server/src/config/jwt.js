const crypto = require('crypto');
require('dotenv').config();

/**
 * Lấy khóa bí mật ký JWT.
 * - Môi trường production: BẮT BUỘC cấu hình JWT_SECRET (tối thiểu 32 ký tự), nếu thiếu server sẽ dừng.
 * - Môi trường phát triển: nếu thiếu sẽ sinh khóa ngẫu nhiên (token mất hiệu lực khi khởi động lại server).
 */
function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET chưa được cấu hình hoặc quá ngắn (tối thiểu 32 ký tự). Không thể khởi động ở chế độ production.');
  }

  console.warn('⚠️  JWT_SECRET chưa được cấu hình hoặc quá ngắn — dùng khóa ngẫu nhiên tạm thời cho môi trường phát triển.');
  return crypto.randomBytes(48).toString('hex');
}

const JWT_SECRET = resolveJwtSecret();

module.exports = { JWT_SECRET };
