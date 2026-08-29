const db = require('../config/db');

class AnalyticsService {
  /**
   * Tính toán toàn bộ dữ liệu thống kê biểu đồ cho một khảo sát
   */
  async getSurveyAnalytics(surveyId, filters = {}) {
    const survey = db.get(`
      SELECT s.*, u.full_name as creator_name, f.name as faculty_name
      FROM surveys s
      JOIN users u ON s.created_by = u.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE s.id = ?
    `, [surveyId]);

    if (!survey) {
      throw { statusCode: 404, message: 'Không tìm thấy phiếu khảo sát.' };
    }

    // Xây dựng câu query lọc responses
    let responseSql = `
      SELECT sr.*, u.full_name, u.student_code, u.class_name, u.academic_year
      FROM survey_responses sr
      LEFT JOIN users u ON sr.student_id = u.id
      WHERE sr.survey_id = ?
    `;
    const responseParams = [surveyId];

    if (filters.className) {
      responseSql += ` AND u.class_name = ?`;
      responseParams.push(filters.className);
    }
    if (filters.academicYear) {
      responseSql += ` AND u.academic_year = ?`;
      responseParams.push(filters.academicYear);
    }
    if (filters.dateFrom) {
      responseSql += ` AND sr.submitted_at >= ?`;
      responseParams.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      responseSql += ` AND sr.submitted_at <= ?`;
      responseParams.push(filters.dateTo + ' 23:59:59');
    }

    const responses = db.query(responseSql, responseParams);
    const totalResponses = responses.length;
    const responseIds = responses.map(r => r.id);

    // Tính thời gian làm bài trung bình
    const totalTimeSeconds = responses.reduce((sum, r) => sum + (r.completion_time_seconds || 0), 0);
    const avgTimeMinutes = totalResponses > 0 ? (totalTimeSeconds / totalResponses / 60).toFixed(1) : 0;

    // Lấy danh sách câu hỏi
    const questions = db.query('SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC, id ASC', [surveyId]);

    const questionAnalytics = [];
    const categoryScores = {};
    let totalLikertSum = 0;
    let totalLikertCount = 0;

    for (const q of questions) {
      const qData = {
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        category: q.category || 'Chung',
        order_index: q.order_index,
        total_answers: 0
      };

      if (responseIds.length === 0) {
        qData.stats = null;
        questionAnalytics.push(qData);
        continue;
      }

      const placeholders = responseIds.map(() => '?').join(',');

      if (q.question_type === 'LIKERT_5') {
        const answers = db.query(
          `SELECT rating_value FROM answers WHERE question_id = ? AND response_id IN (${placeholders}) AND rating_value IS NOT NULL`,
          [q.id, ...responseIds]
        );

        qData.total_answers = answers.length;
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sumRating = 0;

        answers.forEach(a => {
          if (distribution[a.rating_value] !== undefined) {
            distribution[a.rating_value]++;
            sumRating += a.rating_value;
          }
        });

        const avgScore = answers.length > 0 ? Number((sumRating / answers.length).toFixed(2)) : 0;
        qData.stats = {
          average_score: avgScore,
          distribution,
          percentages: {
            1: answers.length > 0 ? Number(((distribution[1] / answers.length) * 100).toFixed(1)) : 0,
            2: answers.length > 0 ? Number(((distribution[2] / answers.length) * 100).toFixed(1)) : 0,
            3: answers.length > 0 ? Number(((distribution[3] / answers.length) * 100).toFixed(1)) : 0,
            4: answers.length > 0 ? Number(((distribution[4] / answers.length) * 100).toFixed(1)) : 0,
            5: answers.length > 0 ? Number(((distribution[5] / answers.length) * 100).toFixed(1)) : 0
          }
        };

        if (avgScore > 0) {
          totalLikertSum += sumRating;
          totalLikertCount += answers.length;

          const cat = q.category || 'Chung';
          if (!categoryScores[cat]) {
            categoryScores[cat] = { sum: 0, count: 0 };
          }
          categoryScores[cat].sum += sumRating;
          categoryScores[cat].count += answers.length;
        }
      } else if (q.question_type === 'SINGLE_CHOICE') {
        const options = db.query('SELECT * FROM question_options WHERE question_id = ? ORDER BY order_index ASC', [q.id]);
        const answers = db.query(
          `SELECT selected_option_id FROM answers WHERE question_id = ? AND response_id IN (${placeholders}) AND selected_option_id IS NOT NULL`,
          [q.id, ...responseIds]
        );

        qData.total_answers = answers.length;
        const optionStats = options.map(opt => {
          const count = answers.filter(a => Number(a.selected_option_id) === Number(opt.id)).length;
          const percentage = answers.length > 0 ? Number(((count / answers.length) * 100).toFixed(1)) : 0;
          return {
            id: opt.id,
            option_text: opt.option_text,
            count,
            percentage
          };
        });

        qData.stats = {
          options: optionStats
        };
      } else if (q.question_type === 'MULTIPLE_CHOICE') {
        const options = db.query('SELECT * FROM question_options WHERE question_id = ? ORDER BY order_index ASC', [q.id]);
        const answers = db.query(
          `SELECT selected_option_ids_json FROM answers WHERE question_id = ? AND response_id IN (${placeholders}) AND selected_option_ids_json IS NOT NULL`,
          [q.id, ...responseIds]
        );

        qData.total_answers = answers.length;
        const counts = {};
        options.forEach(o => { counts[o.id] = 0; });

        answers.forEach(a => {
          try {
            const ids = JSON.parse(a.selected_option_ids_json);
            if (Array.isArray(ids)) {
              ids.forEach(id => {
                if (counts[id] !== undefined) counts[id]++;
              });
            }
          } catch (e) {}
        });

        const optionStats = options.map(opt => {
          const count = counts[opt.id] || 0;
          const percentage = answers.length > 0 ? Number(((count / answers.length) * 100).toFixed(1)) : 0;
          return {
            id: opt.id,
            option_text: opt.option_text,
            count,
            percentage
          };
        });

        qData.stats = {
          options: optionStats
        };
      } else if (q.question_type === 'TEXT') {
        const answers = db.query(`
          SELECT a.text_answer, sr.submitted_at, u.class_name, u.academic_year
          FROM answers a
          JOIN survey_responses sr ON a.response_id = sr.id
          LEFT JOIN users u ON sr.student_id = u.id
          WHERE a.question_id = ? AND a.response_id IN (${placeholders}) AND a.text_answer IS NOT NULL AND TRIM(a.text_answer) != ''
          ORDER BY sr.submitted_at DESC
        `, [q.id, ...responseIds]);

        qData.total_answers = answers.length;
        qData.stats = {
          text_responses: answers
        };
      }

      questionAnalytics.push(qData);
    }

    // Tính điểm trung bình tổng thể toàn khảo sát
    const overallScore = totalLikertCount > 0 ? Number((totalLikertSum / totalLikertCount).toFixed(2)) : 0;

    // Tổng hợp điểm theo từng Category
    const categoryBreakdown = Object.keys(categoryScores).map(cat => ({
      category: cat,
      average_score: Number((categoryScores[cat].sum / categoryScores[cat].count).toFixed(2))
    }));

    // Thống kê theo lớp tham gia (Class Participation)
    const classDistribution = {};
    responses.forEach(r => {
      const cls = r.class_name || 'Khác / Ẩn danh';
      classDistribution[cls] = (classDistribution[cls] || 0) + 1;
    });

    // Thống kê theo ngày nộp (Timeline)
    const timelineMap = {};
    responses.forEach(r => {
      const dateKey = r.submitted_at ? r.submitted_at.split(' ')[0] : 'N/A';
      timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
    });
    const timeline = Object.keys(timelineMap).sort().map(date => ({
      date,
      count: timelineMap[date]
    }));

    // Lấy danh sách các lớp để đổ vào bộ lọc filter
    const availableClasses = db.query(
      `SELECT DISTINCT u.class_name FROM survey_responses sr JOIN users u ON sr.student_id = u.id WHERE sr.survey_id = ? AND u.class_name IS NOT NULL`,
      [surveyId]
    ).map(c => c.class_name);

    return {
      survey,
      summary: {
        total_responses: totalResponses,
        avg_completion_time_minutes: avgTimeMinutes,
        overall_satisfaction_score: overallScore
      },
      category_breakdown: categoryBreakdown,
      class_distribution: classDistribution,
      timeline,
      available_classes: availableClasses,
      questions: questionAnalytics
    };
  }
}

module.exports = new AnalyticsService();
