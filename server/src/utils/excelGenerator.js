const ExcelJS = require('exceljs');
const analyticsService = require('../services/analyticsService');
const db = require('../config/db');

/**
 * Tạo file Excel xuất báo cáo khảo sát chuẩn format DLU
 */
async function generateSurveyExcel(surveyId) {
  const analytics = await analyticsService.getSurveyAnalytics(surveyId);
  const { survey, summary, questions, category_breakdown } = analytics;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Trường Đại học Đà Lạt - Hệ thống Khảo sát DLU';
  workbook.created = new Date();

  // -------------------------------------------------------------
  // Sheet 1: THỐNG KÊ TỔNG QUAN
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Thống kê tổng quan');

  // Header tiêu đề DLU
  summarySheet.mergeCells('A1:G1');
  const titleCell1 = summarySheet.getCell('A1');
  titleCell1.value = 'TRƯỜNG ĐẠI HỌC ĐÀ LẠT - KHOA CÔNG NGHỆ THÔNG TIN';
  titleCell1.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF003366' } };
  titleCell1.alignment = { horizontal: 'center', vertical: 'middle' };

  summarySheet.mergeCells('A2:G2');
  const titleCell2 = summarySheet.getCell('A2');
  titleCell2.value = `BÁO CÁO KẾT QUẢ KHẢO SÁT: ${survey.title.toUpperCase()}`;
  titleCell2.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0B5394' } };
  titleCell2.alignment = { horizontal: 'center', vertical: 'middle' };

  summarySheet.addRow([]);

  // Thông tin tổng quát
  summarySheet.addRow(['Thông tin khảo sát:', '']);
  summarySheet.addRow(['Đơn vị tổ chức:', survey.faculty_name || 'Toàn trường']);
  summarySheet.addRow(['Người tạo:', survey.creator_name]);
  summarySheet.addRow(['Tổng số lượt phản hồi:', summary.total_responses]);
  summarySheet.addRow(['Điểm hài lòng trung bình (thang 5):', `${summary.overall_satisfaction_score} / 5.0`]);
  summarySheet.addRow(['Thời gian làm bài trung bình:', `${summary.avg_completion_time_minutes} phút`]);
  summarySheet.addRow(['Thời điểm xuất báo cáo:', new Date().toLocaleString('vi-VN')]);

  // Format header thông tin
  for (let r = 4; r <= 10; r++) {
    summarySheet.getCell(`A${r}`).font = { bold: true };
  }

  summarySheet.addRow([]);

  // Bảng điểm theo nhóm tiêu chí
  if (category_breakdown && category_breakdown.length > 0) {
    summarySheet.addRow(['ĐIỂM TRUNG BÌNH THEO NHÓM TIÊU CHÍ:']);
    summarySheet.getCell(`A${summarySheet.lastRow.number}`).font = { bold: true, color: { argb: 'FF003366' } };

    const catHeader = summarySheet.addRow(['STT', 'Nhóm tiêu chí', 'Điểm trung bình (Thang 5.0)']);
    catHeader.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6EEF8' } };
      cell.font = { bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    category_breakdown.forEach((cat, index) => {
      const row = summarySheet.addRow([index + 1, cat.category, cat.average_score]);
      row.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    });

    summarySheet.addRow([]);
  }

  // Bảng thống kê chi tiết từng câu hỏi
  summarySheet.addRow(['KẾT QUẢ CHI TIẾT TỪNG CÂU HỎI:']);
  summarySheet.getCell(`A${summarySheet.lastRow.number}`).font = { bold: true, color: { argb: 'FF003366' } };

  const qHeader = summarySheet.addRow(['STT', 'Nội dung câu hỏi', 'Loại câu hỏi', 'Nhóm tiêu chí', 'Số lượt trả lời', 'Điểm TB / Thống kê']);
  qHeader.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B5394' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  questions.forEach((q, idx) => {
    let statText = '-';
    if (q.question_type === 'LIKERT_5' && q.stats) {
      statText = `${q.stats.average_score} / 5.0`;
    } else if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.question_type) && q.stats) {
      statText = q.stats.options.map(o => `${o.option_text}: ${o.count} (${o.percentage}%)`).join(' | ');
    } else if (q.question_type === 'TEXT') {
      statText = `${q.total_answers} câu trả lời tự luận`;
    }

    const typeNames = {
      'LIKERT_5': 'Thang đo Likert (1-5)',
      'SINGLE_CHOICE': 'Trắc nghiệm 1 lựa chọn',
      'MULTIPLE_CHOICE': 'Trắc nghiệm nhiều lựa chọn',
      'TEXT': 'Câu hỏi tự luận'
    };

    const row = summarySheet.addRow([
      idx + 1,
      q.question_text,
      typeNames[q.question_type] || q.question_type,
      q.category,
      q.total_answers,
      statText
    ]);

    row.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  });

  summarySheet.columns = [
    { width: 8 },
    { width: 45 },
    { width: 25 },
    { width: 22 },
    { width: 16 },
    { width: 45 }
  ];

  // -------------------------------------------------------------
  // Sheet 2: DỮ LIỆU CHI TIẾT TỪNG PHẢN HỒI (RAW DATA)
  // -------------------------------------------------------------
  const rawSheet = workbook.addWorksheet('Dữ liệu phản hồi chi tiết');

  const responses = db.query(`
    SELECT sr.*, u.student_code, u.full_name, u.class_name, u.academic_year
    FROM survey_responses sr
    LEFT JOIN users u ON sr.student_id = u.id
    WHERE sr.survey_id = ?
    ORDER BY sr.submitted_at ASC
  `, [surveyId]);

  const rawHeaders = ['Mã phản hồi', 'Mã sinh viên', 'Họ và tên', 'Lớp', 'Khóa', 'Thời gian nộp', 'Thời gian làm (giây)'];
  questions.forEach(q => {
    rawHeaders.push(`[Q${q.order_index}] ${q.question_text}`);
  });

  const rawHeaderRow = rawSheet.addRow(rawHeaders);
  rawHeaderRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Load all answers for this survey
  for (const resp of responses) {
    const studentCode = survey.is_anonymous ? 'Ẩn danh' : (resp.student_code || 'Khách');
    const fullName = survey.is_anonymous ? 'Ẩn danh' : (resp.full_name || 'Khách');
    const className = survey.is_anonymous ? 'Ẩn danh' : (resp.class_name || '-');
    const academicYear = survey.is_anonymous ? 'Ẩn danh' : (resp.academic_year || '-');

    const rowData = [
      resp.id,
      studentCode,
      fullName,
      className,
      academicYear,
      resp.submitted_at,
      resp.completion_time_seconds
    ];

    const answers = db.query('SELECT * FROM answers WHERE response_id = ?', [resp.id]);

    questions.forEach(q => {
      const ans = answers.find(a => Number(a.question_id) === Number(q.id));
      if (!ans) {
        rowData.push('');
      } else if (q.question_type === 'LIKERT_5') {
        rowData.push(ans.rating_value || '');
      } else if (q.question_type === 'SINGLE_CHOICE') {
        const opt = db.get('SELECT option_text FROM question_options WHERE id = ?', [ans.selected_option_id]);
        rowData.push(opt ? opt.option_text : '');
      } else if (q.question_type === 'MULTIPLE_CHOICE') {
        try {
          const ids = JSON.parse(ans.selected_option_ids_json || '[]');
          if (ids.length > 0) {
            const placeholders = ids.map(() => '?').join(',');
            const opts = db.query(`SELECT option_text FROM question_options WHERE id IN (${placeholders})`, ids);
            rowData.push(opts.map(o => o.option_text).join('; '));
          } else {
            rowData.push('');
          }
        } catch (e) {
          rowData.push('');
        }
      } else if (q.question_type === 'TEXT') {
        rowData.push(ans.text_answer || '');
      }
    });

    const dataRow = rawSheet.addRow(rowData);
    dataRow.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  }

  rawSheet.columns = rawHeaders.map(() => ({ width: 22 }));

  return workbook;
}

module.exports = { generateSurveyExcel };
