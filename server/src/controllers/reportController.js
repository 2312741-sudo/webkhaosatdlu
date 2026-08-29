const { generateSurveyExcel } = require('../utils/excelGenerator');
const { generateSurveyPdf } = require('../utils/pdfGenerator');
const db = require('../config/db');

class ReportController {
  /**
   * Xuất báo cáo Excel (.xlsx)
   */
  async exportExcel(req, res, next) {
    try {
      const surveyId = Number(req.params.surveyId);
      const workbook = await generateSurveyExcel(surveyId);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Bao_cao_khao_sat_${surveyId}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xuất báo cáo PDF
   */
  async exportPdf(req, res, next) {
    try {
      const surveyId = Number(req.params.surveyId);
      const pdfBuffer = await generateSurveyPdf(surveyId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Bao_cao_khao_sat_${surveyId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách lịch sử các đợt khảo sát (kèm bộ lọc năm học / học kỳ / khoa / trạng thái)
   */
  async getSurveyHistory(req, res, next) {
    try {
      const { faculty_id, status, search, year } = req.query;

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

      if (status) {
        sql += ` AND s.status = ?`;
        params.push(status);
      }

      if (faculty_id) {
        sql += ` AND s.faculty_id = ?`;
        params.push(faculty_id);
      }

      if (search) {
        sql += ` AND (s.title LIKE ? OR s.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (year) {
        sql += ` AND (s.start_time LIKE ? OR s.created_at LIKE ?)`;
        params.push(`%${year}%`, `%${year}%`);
      }

      sql += ` ORDER BY s.created_at DESC`;

      const surveys = db.query(sql, params);
      res.status(200).json({ success: true, data: surveys });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
