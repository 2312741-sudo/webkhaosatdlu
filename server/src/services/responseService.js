const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');

class ResponseService {
  /**
   * Lấy danh sách khảo sát áp dụng cho sinh viên đang đăng nhập
   */
  async getStudentSurveys(studentUser) {
    const studentId = studentUser.id;
    const facultyCode = studentUser.facultyCode;
    const className = studentUser.className;
    const academicYear = studentUser.academicYear;

    // Lấy tất cả khảo sát đang mở (PUBLISHED) hoặc đã làm
    const surveys = db.query(`
      SELECT s.*, 
             u.full_name as creator_name,
             f.name as faculty_name,
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
      const targets = db.query('SELECT * FROM survey_targets WHERE survey_id = ?', [survey.id]);
      
      let isEligible = false;
      if (targets.length === 0) {
        isEligible = true;
      } else {
        for (const t of targets) {
          if (t.target_type === 'ALL') {
            isEligible = true;
            break;
          }
          if (t.target_type === 'FACULTY' && t.target_value === facultyCode) {
            isEligible = true;
            break;
          }
          if (t.target_type === 'CLASS' && t.target_value === className) {
            isEligible = true;
            break;
          }
          if (t.target_type === 'ACADEMIC_YEAR' && t.target_value === academicYear) {
            isEligible = true;
            break;
          }
        }
      }

      if (isEligible) {
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

    const studentId = studentUser ? studentUser.id : null;

    // Chặn trả lời trùng lặp
    if (studentId) {
      const existing = db.get('SELECT id FROM survey_responses WHERE survey_id = ? AND student_id = ?', [surveyId, studentId]);
      if (existing) {
        throw { statusCode: 400, message: 'Bạn đã hoàn thành khảo sát này trước đó. Mỗi sinh viên chỉ được nộp một lần!' };
      }
    }

    const questions = db.query('SELECT * FROM questions WHERE survey_id = ?', [surveyId]);
    const { answers = [], completion_time_seconds = 0 } = answersData;

    // Kiểm tra các câu hỏi bắt buộc (is_required)
    for (const q of questions) {
      if (q.is_required) {
        const ans = answers.find(a => Number(a.question_id) === Number(q.id));
        if (!ans) {
          throw { statusCode: 400, message: `Vui lòng hoàn thành câu hỏi bắt buộc: "${q.question_text}"` };
        }

        if (q.question_type === 'LIKERT_5' && (!ans.rating_value || ans.rating_value < 1 || ans.rating_value > 5)) {
          throw { statusCode: 400, message: `Vui lòng chọn mức độ đánh giá (1-5 sao) cho câu hỏi: "${q.question_text}"` };
        }
        if (q.question_type === 'SINGLE_CHOICE' && !ans.selected_option_id) {
          throw { statusCode: 400, message: `Vui lòng chọn một phương án cho câu hỏi: "${q.question_text}"` };
        }
        if (q.question_type === 'MULTIPLE_CHOICE' && (!ans.selected_option_ids || ans.selected_option_ids.length === 0)) {
          throw { statusCode: 400, message: `Vui lòng chọn ít nhất một phương án cho câu hỏi: "${q.question_text}"` };
        }
        if (q.question_type === 'TEXT' && (!ans.text_answer || !ans.text_answer.trim())) {
          throw { statusCode: 400, message: `Vui lòng điền câu trả lời cho câu hỏi: "${q.question_text}"` };
        }
      }
    }

    // Thực hiện lưu toàn bộ câu trả lời trong một Transaction
    const responseId = db.transaction((tx) => {
      const res = tx.run(`
        INSERT INTO survey_responses (survey_id, student_id, completion_time_seconds, ip_address)
        VALUES (?, ?, ?, ?)
      `, [surveyId, studentId, completion_time_seconds || 0, ipAddress]);

      const respId = res.lastInsertRowid;

      const insertAns = tx.db.prepare(`
        INSERT INTO answers (response_id, question_id, selected_option_id, selected_option_ids_json, rating_value, text_answer)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const ans of answers) {
        const optionId = ans.selected_option_id || null;
        const optionsJson = ans.selected_option_ids ? JSON.stringify(ans.selected_option_ids) : null;
        const rating = ans.rating_value || null;
        const text = ans.text_answer ? ans.text_answer.trim() : null;

        insertAns.run(respId, ans.question_id, optionId, optionsJson, rating, text);
      }

      return respId;
    });

    logAction(studentId, 'SUBMIT_RESPONSE', 'SURVEY_RESPONSE', responseId, `Sinh viên nộp câu trả lời cho khảo sát ID ${surveyId}`);

    return {
      success: true,
      message: 'Cảm ơn bạn đã tham gia khảo sát! Ý kiến phản hồi của bạn đã được ghi nhận thành công.',
      responseId
    };
  }
}

module.exports = new ResponseService();
