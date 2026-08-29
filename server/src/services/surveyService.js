const crypto = require('crypto');
const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');

class SurveyService {
  /**
   * Lấy danh sách khảo sát dành cho Cán bộ / Quản trị viên
   */
  async getSurveysForManagement(user, query = {}) {
    let sql = `
      SELECT s.*, 
             u.full_name as creator_name,
             f.name as faculty_name,
             (SELECT COUNT(*) FROM questions q WHERE q.survey_id = s.id) as question_count,
             (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id) as response_count
      FROM surveys s
      JOIN users u ON s.created_by = u.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];

    // Nếu là Cán bộ (STAFF), có thể cấu hình xem khảo sát do mình tạo hoặc cùng khoa
    if (user.role === 'STAFF') {
      if (user.facultyId) {
        sql += ` AND (s.created_by = ? OR s.faculty_id = ? OR s.faculty_id IS NULL)`;
        params.push(user.id, user.facultyId);
      } else {
        sql += ` AND s.created_by = ?`;
        params.push(user.id);
      }
    }

    if (query.status) {
      sql += ` AND s.status = ?`;
      params.push(query.status);
    }

    if (query.search) {
      sql += ` AND (s.title LIKE ? OR s.description LIKE ?)`;
      params.push(`%${query.search}%`, `%${query.search}%`);
    }

    sql += ` ORDER BY s.created_at DESC`;

    const surveys = db.query(sql, params);

    // Gắn thêm thông tin targets cho từng khảo sát
    for (const survey of surveys) {
      survey.targets = db.query('SELECT * FROM survey_targets WHERE survey_id = ?', [survey.id]);
    }

    return surveys;
  }

  /**
   * Lấy chi tiết một khảo sát theo ID (kèm câu hỏi và đối tượng áp dụng)
   */
  async getSurveyDetail(surveyId, user) {
    const survey = db.get(`
      SELECT s.*, 
             u.full_name as creator_name,
             f.name as faculty_name,
             (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id) as response_count
      FROM surveys s
      JOIN users u ON s.created_by = u.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE s.id = ?
    `, [surveyId]);

    if (!survey) {
      throw { statusCode: 404, message: 'Không tìm thấy phiếu khảo sát.' };
    }

    // Lấy danh sách đối tượng áp dụng
    survey.targets = db.query('SELECT * FROM survey_targets WHERE survey_id = ?', [surveyId]);

    // Lấy danh sách câu hỏi kèm các phương án lựa chọn
    const questions = db.query('SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC', [surveyId]);
    for (const q of questions) {
      if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.question_type)) {
        q.options = db.query('SELECT * FROM question_options WHERE question_id = ? ORDER BY order_index ASC', [q.id]);
      } else {
        q.options = [];
      }
    }
    survey.questions = questions;

    return survey;
  }

  /**
   * Tạo mới phiếu khảo sát
   */
  async createSurvey(data, user) {
    const { title, description, faculty_id, start_time, end_time, is_anonymous, targets = [] } = data;

    if (!title || !title.trim()) {
      throw { statusCode: 400, message: 'Tiêu đề khảo sát không được để trống.' };
    }

    const accessToken = 'dlu-' + crypto.randomBytes(6).toString('hex');
    const facultyId = faculty_id || user.facultyId || null;

    const result = db.transaction((tx) => {
      const res = tx.run(`
        INSERT INTO surveys (title, description, created_by, faculty_id, status, start_time, end_time, is_anonymous, access_token)
        VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)
      `, [
        title.trim(),
        description ? description.trim() : '',
        user.id,
        facultyId,
        start_time || null,
        end_time || null,
        is_anonymous ? 1 : 0,
        accessToken
      ]);

      const surveyId = res.lastInsertRowid;

      // Lưu targets
      if (targets && targets.length > 0) {
        const insertTarget = tx.db.prepare('INSERT INTO survey_targets (survey_id, target_type, target_value) VALUES (?, ?, ?)');
        for (const target of targets) {
          insertTarget.run(surveyId, target.target_type || 'ALL', target.target_value || 'ALL');
        }
      } else {
        tx.run('INSERT INTO survey_targets (survey_id, target_type, target_value) VALUES (?, ?, ?)', [surveyId, 'ALL', 'ALL']);
      }

      return surveyId;
    });

    logAction(user.id, 'CREATE_SURVEY', 'SURVEY', result, `Tạo mới khảo sát: ${title}`);
    return this.getSurveyDetail(result, user);
  }

  /**
   * Cập nhật thông tin phiếu khảo sát
   */
  async updateSurvey(surveyId, data, user) {
    const survey = db.get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey) {
      throw { statusCode: 404, message: 'Không tìm thấy khảo sát.' };
    }

    // Kiểm tra quyền: Admin hoặc người tạo
    if (user.role !== 'ADMIN' && survey.created_by !== user.id) {
      throw { statusCode: 403, message: 'Bạn không có quyền chỉnh sửa khảo sát này.' };
    }

    const { title, description, faculty_id, start_time, end_time, is_anonymous, targets } = data;

    db.transaction((tx) => {
      tx.run(`
        UPDATE surveys
        SET title = ?, description = ?, faculty_id = ?, start_time = ?, end_time = ?, is_anonymous = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        title !== undefined ? title.trim() : survey.title,
        description !== undefined ? description.trim() : survey.description,
        faculty_id !== undefined ? faculty_id : survey.faculty_id,
        start_time !== undefined ? start_time : survey.start_time,
        end_time !== undefined ? end_time : survey.end_time,
        is_anonymous !== undefined ? (is_anonymous ? 1 : 0) : survey.is_anonymous,
        surveyId
      ]);

      if (targets && Array.isArray(targets)) {
        tx.run('DELETE FROM survey_targets WHERE survey_id = ?', [surveyId]);
        const insertTarget = tx.db.prepare('INSERT INTO survey_targets (survey_id, target_type, target_value) VALUES (?, ?, ?)');
        for (const target of targets) {
          insertTarget.run(surveyId, target.target_type, target.target_value);
        }
      }
    });

    logAction(user.id, 'UPDATE_SURVEY', 'SURVEY', surveyId, `Cập nhật khảo sát ID ${surveyId}`);
    return this.getSurveyDetail(surveyId, user);
  }

  /**
   * Thay đổi trạng thái khảo sát (DRAFT -> PUBLISHED -> CLOSED)
   */
  async updateSurveyStatus(surveyId, status, user) {
    if (!['DRAFT', 'PUBLISHED', 'CLOSED'].includes(status)) {
      throw { statusCode: 400, message: 'Trạng thái không hợp lệ. Cho phép: DRAFT, PUBLISHED, CLOSED.' };
    }

    const survey = db.get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey) {
      throw { statusCode: 404, message: 'Không tìm thấy khảo sát.' };
    }

    if (user.role !== 'ADMIN' && survey.created_by !== user.id) {
      throw { statusCode: 403, message: 'Bạn không có quyền thay đổi trạng thái khảo sát này.' };
    }

    // Nếu chuyển sang PUBLISHED, kiểm tra khảo sát phải có ít nhất 1 câu hỏi
    if (status === 'PUBLISHED') {
      const qCount = db.get('SELECT COUNT(*) as count FROM questions WHERE survey_id = ?', [surveyId]);
      if (!qCount || qCount.count === 0) {
        throw { statusCode: 400, message: 'Khảo sát phải có ít nhất một câu hỏi trước khi phát hành!' };
      }
    }

    db.run('UPDATE surveys SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, surveyId]);
    logAction(user.id, 'UPDATE_SURVEY_STATUS', 'SURVEY', surveyId, `Chuyển trạng thái khảo sát sang ${status}`);

    return { success: true, message: `Đã chuyển trạng thái khảo sát thành công sang: ${status}` };
  }

  /**
   * Xóa khảo sát
   */
  async deleteSurvey(surveyId, user) {
    const survey = db.get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey) {
      throw { statusCode: 404, message: 'Không tìm thấy khảo sát.' };
    }

    if (user.role !== 'ADMIN' && survey.created_by !== user.id) {
      throw { statusCode: 403, message: 'Bạn không có quyền xóa khảo sát này.' };
    }

    // Không cho phép xóa khảo sát đã có phản hồi trừ khi là Admin
    const responseCount = db.get('SELECT COUNT(*) as count FROM survey_responses WHERE survey_id = ?', [surveyId]);
    if (responseCount.count > 0 && user.role !== 'ADMIN') {
      throw { statusCode: 400, message: 'Khảo sát đã có lượt phản hồi của sinh viên, chỉ Quản trị viên mới có thể xóa.' };
    }

    db.run('DELETE FROM surveys WHERE id = ?', [surveyId]);
    logAction(user.id, 'DELETE_SURVEY', 'SURVEY', surveyId, `Xóa khảo sát: ${survey.title}`);

    return { message: 'Đã xóa khảo sát thành công!' };
  }

  /**
   * Nhân bản khảo sát (Duplicate survey)
   */
  async duplicateSurvey(surveyId, user) {
    const original = await this.getSurveyDetail(surveyId, user);
    const newAccessToken = 'dlu-' + crypto.randomBytes(6).toString('hex');

    const newSurveyId = db.transaction((tx) => {
      // 1. Tạo bản sao survey
      const res = tx.run(`
        INSERT INTO surveys (title, description, created_by, faculty_id, status, start_time, end_time, is_anonymous, access_token)
        VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)
      `, [
        `[Bản sao] ${original.title}`,
        original.description,
        user.id,
        original.faculty_id,
        original.start_time,
        original.end_time,
        original.is_anonymous,
        newAccessToken
      ]);

      const newId = res.lastInsertRowid;

      // 2. Sao chép targets
      const insertTarget = tx.db.prepare('INSERT INTO survey_targets (survey_id, target_type, target_value) VALUES (?, ?, ?)');
      for (const t of original.targets) {
        insertTarget.run(newId, t.target_type, t.target_value);
      }

      // 3. Sao chép câu hỏi & options
      const insertQ = tx.db.prepare(`
        INSERT INTO questions (survey_id, question_text, question_type, is_required, order_index, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const insertOpt = tx.db.prepare(`
        INSERT INTO question_options (question_id, option_text, score_value, order_index)
        VALUES (?, ?, ?, ?)
      `);

      for (const q of original.questions) {
        const qRes = insertQ.run(newId, q.question_text, q.question_type, q.is_required, q.order_index, q.category);
        const newQId = qRes.lastInsertRowid;

        if (q.options && q.options.length > 0) {
          for (const opt of q.options) {
            insertOpt.run(newQId, opt.option_text, opt.score_value, opt.order_index);
          }
        }
      }

      return newId;
    });

    logAction(user.id, 'DUPLICATE_SURVEY', 'SURVEY', newSurveyId, `Nhân bản từ khảo sát ID ${surveyId}`);
    return this.getSurveyDetail(newSurveyId, user);
  }

  /**
   * Lấy danh sách tất cả các Khoa để hiển thị dropdown lựa chọn
   */
  async getFaculties() {
    return db.query('SELECT * FROM faculties ORDER BY name ASC');
  }
}

module.exports = new SurveyService();
