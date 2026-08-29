const db = require('../config/db');

/**
 * Ghi lại nhật ký hành động vào bảng audit_logs
 */
function logAction(userId, action, entityType, entityId, details = null) {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
    db.run(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId || null, action, entityType, entityId ? String(entityId) : null, detailsStr]
    );
  } catch (error) {
    console.error('Không thể ghi audit log:', error.message);
  }
}

module.exports = { logAction };
