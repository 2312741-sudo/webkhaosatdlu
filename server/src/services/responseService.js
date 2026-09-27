const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');

const DUPLICATE_MESSAGE = 'Bạn đã hoàn thành khảo sát này trước đó. Mỗi sinh viên chỉ được nộp một lần!';
const MAX_TEXT_ANSWER_LENGTH = 5000;

class ResponseService {
  /**
   * Lấy thông tin Khoa / Lớp / Khóa mới nhất của sinh viên từ CSDL (không tin dữ liệu cũ trong JWT)
   */
  getStudentProfile(userId) {
    const student = db.get(`
      SELECT u.faculty_id, u.class_name, u.academic_year, f.code as faculty_code
      FROM users u
      LEFT JOIN faculties f ON u.faculty_id = f.id
      WHERE u.id = ?
    `, [userId]) || {};

    const norm = (v) => (v === null || v === undefined ? '' : String(v)).trim().toUpperCase();
    return {
      facultyId: student.faculty_id ? String(student.faculty_id) : '',
      facultyCode: norm(student.faculty_code),
      className: norm(student.class_name),
      academicYear: norm(student.academic_year)
    };
  }

  /**
   * Kiểm tra sinh viên có thuộc đối tượng áp dụng của khảo sát không.
   * - Không có target hoặc có target ALL: áp dụng cho mọi sinh viên.
   * - Ngược lại, sinh viên phải khớp ít nhất một target (Khoa / Lớp / Khóa).
   *   Sinh viên chưa có thông tin Lớp / Khóa thì KHÔNG khớp các target Lớp / Khóa.
   */
  isStudentEligible(surveyId, profile) {
    const targets = db.query('SELECT target_type, target_value FROM survey_targets WHERE survey_id = ?', [surveyId]);
    if (targets.length === 0) return true;

    return targets.some((t) => {
      const type = (t.target_type || '').toUpperCase();
      const value = (t.target_value || '').trim().toUpperCase();

      if (type === 'ALL') return true;
      if (!value) return false;
      if (type === 'FACULTY') return value === profile.facultyCode || value === profile.facultyId;
      if (type === 'CLASS') return !!profile.className && value === profile.className;
      if (type === 'ACADEMIC_YEAR') return !!profile.academicYear && value === profile.academicYear;
      return false;
    });
  }

  /**
   * Lấy danh sách khảo sát áp dụng cho sinh viên đang đăng nhập
   */
  async getStudentSurveys(studentUser) {
    const studentId = studentUser.id;
    const profile = this.getStudentProfile(studentId);

    // Lấy tất cả khảo sát đang mở (PUBLISHED) hoặc đã kết thúc (CLOSED)
    const surveys = db.query(`
      SELECT s.*, 
             u.full_name as creator_name,
             f.name as faculty_name,
             f.code as faculty_code,
             (SELECT COUNT(*) FROM questions q WHERE q.survey_id = s.id) as question_count,
             (SELECT id FROM survey_responses sr WHERE sr.survey_id = s.id AND sr.student_id = ?) as response_id,
             (SELECT submitted_at FROM survey_responses sr WHERE sr.survey_id = s.id AND sr.student_id = ?) as student_submitted_at
      FROM surveys s
      JOIN users u ON s.created_by = u.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE s.status IN ('PUBLISHED', 'CLOSED')
      ORDER BY s.created_at DESC
    `, [studentId, studentId]);

    // Lọc theo đối tượng áp dụng (Target Filters)
    const eligibleSurveys = [];
    for (const survey of surveys) {
      if (this.isStudentEligible(survey.id, profile)) {
        survey.has_submitted = !!survey.response_id;
        eligibleSurveys.push(survey);
      }
    }

    return eligibleSurveys;
  }

  /**
   * Lấy chi tiết phiếu khảo sát để sinh viên làm bài (theo Token hoặc ID)
   */
  async getSurveyForAnswering(identifier, studentUser = null) {
    const isNumeric = !isNaN(identifier);
    const survey = db.get(`
      SELECT s.*, 
             u.full_name as creator_name,
             f.name as faculty_name
      FROM surveys s
      JOIN users u ON s.created_by = u.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE ${isNumeric ? 's.id = ?' : 's.access_token = ?'}
    `, [identifier]);

    if (!survey) {
      throw { statusCode: 404, message: 'Không tìm thấy phiếu khảo sát.' };
    }

    if (survey.status === 'DRAFT') {
      // Cho phép cán bộ / admin xem trước (preview)
      if (!studentUser || (studentUser.role !== 'STAFF' && studentUser.role !== 'ADMIN')) {
        throw { statusCode: 403, message: 'Khảo sát này chưa được phát hành.' };
      }
    }

    if (studentUser && studentUser.role === 'STUDENT' && !this.isStudentEligible(survey.id, this.getStudentProfile(studentUser.id))) {
      throw { statusCode: 403, message: 'Khảo sát này không dành cho Khoa / Lớp / Khóa của bạn.' };
    }

    // Kiểm tra xem sinh viên đã nộp bài khảo sát này chưa (Chặn nộp trùng)
    let hasSubmitted = false;
    let submittedAt = null;
    if (studentUser && studentUser.role === 'STUDENT') {
      const existingResponse = db.get(
        'SELECT id, submitted_at FROM survey_responses WHERE survey_id = ? AND student_id = ?',
        [survey.id, studentUser.id]
      );
      if (existingResponse) {
        hasSubmitted = true;
        submittedAt = existingResponse.submitted_at;
      }
    }

    // Lấy danh sách câu hỏi và tùy chọn
    const questions = db.query('SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC, id ASC', [survey.id]);
    for (const q of questions) {
      if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.question_type)) {
        q.options = db.query('SELECT * FROM question_options WHERE question_id = ? ORDER BY order_index ASC, id ASC', [q.id]);
      } else {
        q.options = [];
      }
    }

    return {
      survey,
      questions,
      hasSubmitted,
      submittedAt
    };
  }

  /**
   * Kiểm tra & chuẩn hóa câu trả lời:
   * - Câu hỏi phải thuộc đúng khảo sát, không trả lời trùng một câu hai lần
   * - Phương án chọn phải thuộc đúng câu hỏi, điểm Likert là số nguyên 1–5
   * - Câu trả lời trống của câu không bắt buộc sẽ được bỏ qua
   */
  validateAnswers(surveyId, answers) {
    const questions = db.query('SELECT * FROM questions WHERE survey_id = ?', [surveyId]);
    const questionMap = new Map(questions.map(q => [q.id, q]));
    const seen = new Set();
    const cleanAnswers = [];

    for (const ans of answers) {
      const questionId = Number(ans && ans.question_id);
      const q = questionMap.get(questionId);
      if (!q) {
        throw { statusCode: 400, message: 'Câu trả lời chứa câu hỏi không thuộc phiếu khảo sát này.' };
      }
      if (seen.has(questionId)) {
        throw { statusCode: 400, message: `Câu hỏi "${q.question_text}" bị trả lời nhiều lần.` };
      }
      seen.add(questionId);

      const clean = {
        question_id: questionId,
        selected_option_id: null,
        selected_option_ids_json: null,
        rating_value: null,
        text_answer: null
      };

      if (q.question_type === 'LIKERT_5') {
        if (ans.rating_value !== null && ans.rating_value !== undefined && ans.rating_value !== '') {
          const rating = Number(ans.rating_value);
          if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw { statusCode: 400, message: `Mức độ đánh giá không hợp lệ (1-5) cho câu hỏi: "${q.question_text}"` };
          }
          clean.rating_value = rating;
        }
      } else if (q.question_type === 'SINGLE_CHOICE' || q.question_type === 'MULTIPLE_CHOICE') {
        const validOptionIds = new Set(
          db.query('SELECT id FROM question_options WHERE question_id = ?', [questionId]).map(o => o.id)
        );
        const isValidOption = (id) => Number.isInteger(id) && validOptionIds.has(id);

        if (q.question_type === 'SINGLE_CHOICE') {
          if (ans.selected_option_id) {
            const optionId = Number(ans.selected_option_id);
            if (!isValidOption(optionId)) {
              throw { statusCode: 400, message: `Phương án chọn không hợp lệ cho câu hỏi: "${q.question_text}"` };
            }
            clean.selected_option_id = optionId;
          }
        } else if (Array.isArray(ans.selected_option_ids) && ans.selected_option_ids.length > 0) {
          const optionIds = [...new Set(ans.selected_option_ids.map(Number))];
          if (!optionIds.every(isValidOption)) {
            throw { statusCode: 400, message: `Phương án chọn không hợp lệ cho câu hỏi: "${q.question_text}"` };
          }
          clean.selected_option_ids_json = JSON.stringify(optionIds);
        }
      } else if (q.question_type === 'TEXT') {
        const text = typeof ans.text_answer === 'string' ? ans.text_answer.trim() : '';
        if (text.length > MAX_TEXT_ANSWER_LENGTH) {
          throw { statusCode: 400, message: `Câu trả lời quá dài (tối đa ${MAX_TEXT_ANSWER_LENGTH} ký tự) cho câu hỏi: "${q.question_text}"` };
        }
        clean.text_answer = text || null;
      }

      const isEmpty = clean.rating_value === null && clean.selected_option_id === null
        && clean.selected_option_ids_json === null && clean.text_answer === null;
      if (!isEmpty) {
        cleanAnswers.push(clean);
      }
    }

    // Kiểm tra các câu hỏi bắt buộc (is_required)
    const answeredIds = new Set(cleanAnswers.map(a => a.question_id));
    for (const q of questions) {
      if (q.is_required && !answeredIds.has(q.id)) {
        throw { statusCode: 400, message: `Vui lòng hoàn thành câu hỏi bắt buộc: "${q.question_text}"` };
      }
    }

    return cleanAnswers;
  }

  /**
   * Nộp câu trả lời khảo sát
   */
  async submitSurveyResponse(surveyId, answersData, studentUser, ipAddress = '') {
    const survey = db.get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey) {
      throw { statusCode: 404, message: 'Không tìm thấy phiếu khảo sát.' };
    }

    if (survey.status !== 'PUBLISHED') {
      throw { statusCode: 400, message: 'Khảo sát này hiện không mở để nhận câu trả lời.' };
    }

    // Kiểm tra thời hạn nếu có
    const now = new Date();
    if (survey.start_time && new Date(survey.start_time) > now) {
      throw { statusCode: 400, message: 'Khảo sát chưa đến thời gian bắt đầu.' };
    }
    if (survey.end_time && new Date(survey.end_time) < now) {
      throw { statusCode: 400, message: 'Khảo sát đã hết thời hạn nhận phản hồi.' };
    }

    // Chỉ sinh viên mới được nộp bài (tránh cán bộ / admin làm sai lệch số liệu thống kê)
    if (!studentUser || studentUser.role !== 'STUDENT') {
      throw { statusCode: 403, message: 'Chỉ tài khoản sinh viên mới được nộp phiếu khảo sát. Cán bộ chỉ có thể xem trước.' };
    }
    const studentId = studentUser.id;

    if (!this.isStudentEligible(surveyId, this.getStudentProfile(studentId))) {
      throw { statusCode: 403, message: 'Khảo sát này không dành cho Khoa / Lớp / Khóa của bạn.' };
    }

    // Chặn trả lời trùng lặp
    const existing = db.get('SELECT id FROM survey_responses WHERE survey_id = ? AND student_id = ?', [surveyId, studentId]);
    if (existing) {
      throw { statusCode: 400, message: DUPLICATE_MESSAGE };
    }

    const { answers = [], completion_time_seconds = 0 } = answersData || {};
    if (!Array.isArray(answers)) {
      throw { statusCode: 400, message: 'Dữ liệu câu trả lời không hợp lệ.' };
    }

    const cleanAnswers = this.validateAnswers(surveyId, answers);
    const completionSeconds = Math.max(0, Math.min(Number.parseInt(completion_time_seconds, 10) || 0, 24 * 60 * 60));

    // Khảo sát ẩn danh: không lưu IP để không thể truy ngược người trả lời
    const storedIp = survey.is_anonymous ? null : (ipAddress || null);

    // Thực hiện lưu toàn bộ câu trả lời trong một Transaction
    let responseId;
    try {
      responseId = db.transaction((tx) => {
        const res = tx.run(`
          INSERT INTO survey_responses (survey_id, student_id, completion_time_seconds, ip_address)
          VALUES (?, ?, ?, ?)
        `, [surveyId, studentId, completionSeconds, storedIp]);

        const respId = res.lastInsertRowid;

        const insertAns = tx.db.prepare(`
          INSERT INTO answers (response_id, question_id, selected_option_id, selected_option_ids_json, rating_value, text_answer)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const ans of cleanAnswers) {
          insertAns.run(respId, ans.question_id, ans.selected_option_id, ans.selected_option_ids_json, ans.rating_value, ans.text_answer);
        }

        return respId;
      });
    } catch (error) {
      // Hai request nộp cùng lúc: ràng buộc UNIQUE(survey_id, student_id) chặn bản ghi thứ hai
      if (/UNIQUE constraint failed/i.test(error.message || '')) {
        throw { statusCode: 400, message: DUPLICATE_MESSAGE };
      }
      throw error;
    }

    if (survey.is_anonymous) {
      logAction(studentId, 'SUBMIT_RESPONSE', 'SURVEY', surveyId, `Sinh viên nộp câu trả lời cho khảo sát ẩn danh ID ${surveyId}`);
    } else {
      logAction(studentId, 'SUBMIT_RESPONSE', 'SURVEY_RESPONSE', responseId, `Sinh viên nộp câu trả lời cho khảo sát ID ${surveyId}`);
    }

    return {
      success: true,
      message: 'Cảm ơn bạn đã tham gia khảo sát! Ý kiến phản hồi của bạn đã được ghi nhận thành công.',
      responseId
    };
  }
}

module.exports = new ResponseService();
