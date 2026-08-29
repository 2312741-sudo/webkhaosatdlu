const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');

class QuestionService {
  /**
   * Lấy danh sách câu hỏi của một khảo sát
   */
  async getQuestionsBySurvey(surveyId) {
    const questions = db.query('SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC, id ASC', [surveyId]);
    for (const q of questions) {
      if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.question_type)) {
        q.options = db.query('SELECT * FROM question_options WHERE question_id = ? ORDER BY order_index ASC, id ASC', [q.id]);
      } else {
        q.options = [];
      }
    }
    return questions;
  }

  /**
   * Thêm câu hỏi mới vào khảo sát
   */
  async createQuestion(surveyId, data, user) {
    const { question_text, question_type, is_required = 1, category = 'Chung', options = [] } = data;

    if (!question_text || !question_text.trim()) {
      throw { statusCode: 400, message: 'Nội dung câu hỏi không được để trống.' };
    }

    if (!['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'LIKERT_5', 'TEXT'].includes(question_type)) {
      throw { statusCode: 400, message: 'Loại câu hỏi không hợp lệ.' };
    }

    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question_type) && (!options || options.length < 2)) {
      throw { statusCode: 400, message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 phương án lựa chọn.' };
    }

    const survey = db.get('SELECT * FROM surveys WHERE id = ?', [surveyId]);
    if (!survey) {
      throw { statusCode: 404, message: 'Không tìm thấy khảo sát.' };
    }

    // Tính thứ tự câu hỏi tiếp theo
    const maxOrder = db.get('SELECT MAX(order_index) as max_order FROM questions WHERE survey_id = ?', [surveyId]);
    const nextOrder = (maxOrder && maxOrder.max_order !== null) ? maxOrder.max_order + 1 : 1;

    const questionId = db.transaction((tx) => {
      const res = tx.run(`
        INSERT INTO questions (survey_id, question_text, question_type, is_required, order_index, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        surveyId,
        question_text.trim(),
        question_type,
        is_required ? 1 : 0,
        nextOrder,
        category ? category.trim() : 'Chung'
      ]);

      const qId = res.lastInsertRowid;

      if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question_type) && options.length > 0) {
        const insertOpt = tx.db.prepare(`
          INSERT INTO question_options (question_id, option_text, score_value, order_index)
          VALUES (?, ?, ?, ?)
        `);

        options.forEach((optText, index) => {
          const text = typeof optText === 'object' ? optText.option_text : optText;
          const score = typeof optText === 'object' ? optText.score_value : null;
          if (text && text.trim()) {
            insertOpt.run(qId, text.trim(), score || null, index + 1);
          }
        });
      }

      return qId;
    });

    logAction(user.id, 'CREATE_QUESTION', 'QUESTION', questionId, `Thêm câu hỏi mới vào khảo sát ID ${surveyId}`);
    return this.getQuestionById(questionId);
  }

  /**
   * Lấy chi tiết một câu hỏi
   */
  async getQuestionById(questionId) {
    const question = db.get('SELECT * FROM questions WHERE id = ?', [questionId]);
    if (!question) {
      throw { statusCode: 404, message: 'Không tìm thấy câu hỏi.' };
    }

    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question.question_type)) {
      question.options = db.query('SELECT * FROM question_options WHERE question_id = ? ORDER BY order_index ASC', [questionId]);
    } else {
      question.options = [];
    }

    return question;
  }

  /**
   * Cập nhật câu hỏi và danh sách options
   */
  async updateQuestion(questionId, data, user) {
    const question = db.get('SELECT * FROM questions WHERE id = ?', [questionId]);
    if (!question) {
      throw { statusCode: 404, message: 'Không tìm thấy câu hỏi.' };
    }

    const { question_text, question_type, is_required, category, options } = data;

    db.transaction((tx) => {
      tx.run(`
        UPDATE questions
        SET question_text = ?, question_type = ?, is_required = ?, category = ?
        WHERE id = ?
      `, [
        question_text !== undefined ? question_text.trim() : question.question_text,
        question_type !== undefined ? question_type : question.question_type,
        is_required !== undefined ? (is_required ? 1 : 0) : question.is_required,
        category !== undefined ? category.trim() : question.category,
        questionId
      ]);

      const currentType = question_type || question.question_type;

      if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(currentType) && options) {
        tx.run('DELETE FROM question_options WHERE question_id = ?', [questionId]);
        const insertOpt = tx.db.prepare(`
          INSERT INTO question_options (question_id, option_text, score_value, order_index)
          VALUES (?, ?, ?, ?)
        `);

        options.forEach((optText, index) => {
          const text = typeof optText === 'object' ? optText.option_text : optText;
          const score = typeof optText === 'object' ? optText.score_value : null;
          if (text && text.trim()) {
            insertOpt.run(questionId, text.trim(), score || null, index + 1);
          }
        });
      } else if (!['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(currentType)) {
        tx.run('DELETE FROM question_options WHERE question_id = ?', [questionId]);
      }
    });

    logAction(user.id, 'UPDATE_QUESTION', 'QUESTION', questionId, `Cập nhật câu hỏi ID ${questionId}`);
    return this.getQuestionById(questionId);
  }

  /**
   * Xóa câu hỏi
   */
  async deleteQuestion(questionId, user) {
    const question = db.get('SELECT * FROM questions WHERE id = ?', [questionId]);
    if (!question) {
      throw { statusCode: 404, message: 'Không tìm thấy câu hỏi.' };
    }

    db.run('DELETE FROM questions WHERE id = ?', [questionId]);
    logAction(user.id, 'DELETE_QUESTION', 'QUESTION', questionId, `Xóa câu hỏi ID ${questionId}`);

    return { message: 'Đã xóa câu hỏi thành công!' };
  }

  /**
   * Sắp xếp lại thứ tự câu hỏi
   */
  async reorderQuestions(surveyId, questionIds) {
    if (!Array.isArray(questionIds)) {
      throw { statusCode: 400, message: 'Danh sách ID câu hỏi không hợp lệ.' };
    }

    db.transaction((tx) => {
      const updateStmt = tx.db.prepare('UPDATE questions SET order_index = ? WHERE id = ? AND survey_id = ?');
      questionIds.forEach((id, index) => {
        updateStmt.run(index + 1, id, surveyId);
      });
    });

    return { message: 'Đã cập nhật thứ tự câu hỏi thành công!' };
  }
}

module.exports = new QuestionService();
