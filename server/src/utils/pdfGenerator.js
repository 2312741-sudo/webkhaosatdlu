const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const analyticsService = require('../services/analyticsService');

const FONT_REGULAR = path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf');
const FONT_BOLD = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');
const FONT_ITALIC = path.join(__dirname, '../assets/fonts/Roboto-Italic.ttf');

/**
 * Tạo tài liệu PDF báo cáo khảo sát với font tiếng Việt Unicode chuẩn
 */
async function generateSurveyPdf(surveyId) {
  const analytics = await analyticsService.getSurveyAnalytics(surveyId);
  const { survey, summary, category_breakdown, questions } = analytics;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // Đăng ký font hỗ trợ tiếng Việt có dấu đầy đủ
    if (fs.existsSync(FONT_REGULAR) && fs.existsSync(FONT_BOLD)) {
      doc.registerFont('DLU-Font', FONT_REGULAR);
      doc.registerFont('DLU-Font-Bold', FONT_BOLD);
      if (fs.existsSync(FONT_ITALIC)) {
        doc.registerFont('DLU-Font-Italic', FONT_ITALIC);
      }
      doc.font('DLU-Font');
    }

    const fontRegular = fs.existsSync(FONT_REGULAR) ? 'DLU-Font' : 'Helvetica';
    const fontBold = fs.existsSync(FONT_BOLD) ? 'DLU-Font-Bold' : 'Helvetica-Bold';
    const fontItalic = fs.existsSync(FONT_ITALIC) ? 'DLU-Font-Italic' : 'Helvetica-Oblique';

    // Header DLU
    doc.fontSize(11).font(fontBold).fillColor('#0F5132').text('BỘ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG ĐẠI HỌC ĐÀ LẠT', { align: 'center' });
    doc.fontSize(10).font(fontBold).fillColor('#1B4D3E').text('KHOA CÔNG NGHỆ THÔNG TIN', { align: 'center' });
    doc.fontSize(9).font(fontItalic).fillColor('#666666').text('Hệ thống Khảo sát Mức độ Hài lòng Sinh viên (DLU) — "Thụ nhân – Khai phóng – Bản sắc"', { align: 'center' });
    doc.moveDown(0.4);
    doc.strokeColor('#C9A227').lineWidth(1.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.8);

    // Title
    doc.fontSize(15).font(fontBold).fillColor('#0F5132')
       .text('BÁO CÁO KẾT QUẢ KHẢO SÁT', { align: 'center' });
    doc.fontSize(11).font(fontBold).fillColor('#C0392B')
       .text((survey.title || '').toUpperCase(), { align: 'center' });
    doc.moveDown(0.8);

    // Metadata
    doc.fontSize(9.5).font(fontRegular).fillColor('#222222');
    doc.text(`• Đơn vị tổ chức: ${survey.faculty_name || 'Toàn trường'}`);
    doc.text(`• Người lập khảo sát: ${survey.creator_name || 'Cán bộ khảo sát'}`);
    doc.text(`• Tổng số lượt sinh viên tham gia: ${summary.total_responses} lượt phản hồi`);
    doc.text(`• Điểm đánh giá hài lòng trung bình: ${summary.overall_satisfaction_score} / 5.0 ⭐`);
    doc.text(`• Thời gian làm bài trung bình: ${summary.avg_completion_time_minutes} phút`);
    doc.text(`• Thời điểm xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`);
    doc.moveDown(0.8);

    // Category breakdown
    if (category_breakdown && category_breakdown.length > 0) {
      doc.fontSize(10.5).font(fontBold).fillColor('#0F5132').text('1. ĐIỂM TRUNG BÌNH THEO NHÓM TIÊU CHÍ:');
      doc.moveDown(0.3);
      doc.fontSize(9.5).font(fontRegular).fillColor('#333333');
      category_breakdown.forEach((cat, idx) => {
        doc.text(`   ${idx + 1}. Nhóm "${cat.category}": ${cat.average_score} / 5.0 điểm`);
      });
      doc.moveDown(0.8);
    }

    // Questions detail
    doc.fontSize(10.5).font(fontBold).fillColor('#0F5132').text('2. KẾT QUẢ CHI TIẾT TỪNG CÂU HỎI:');
    doc.moveDown(0.4);

    questions.forEach((q, idx) => {
      doc.fontSize(9.5).font(fontBold).fillColor('#111827')
         .text(`Câu ${idx + 1}: ${q.question_text}`);
      doc.fontSize(8.5).font(fontRegular).fillColor('#6B7280')
         .text(`   [Loại: ${q.question_type === 'LIKERT_5' ? 'Thang đo Likert 5 mức' : q.question_type === 'SINGLE_CHOICE' ? 'Trắc nghiệm 1 đáp án' : q.question_type === 'MULTIPLE_CHOICE' ? 'Nhiều lựa chọn' : 'Tự luận đóng góp ý kiến'} | Nhóm: ${q.category} | Số phản hồi: ${q.total_answers}]`);

      if (q.question_type === 'LIKERT_5' && q.stats) {
        doc.font(fontRegular).fillColor('#047857')
           .text(`   => Điểm trung bình: ${q.stats.average_score} / 5.0 (1 sao: ${q.stats.percentages[1]}%, 2 sao: ${q.stats.percentages[2]}%, 3 sao: ${q.stats.percentages[3]}%, 4 sao: ${q.stats.percentages[4]}%, 5 sao: ${q.stats.percentages[5]}%)`);
      } else if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.question_type) && q.stats) {
        const optSummary = q.stats.options.map(o => `${o.option_text}: ${o.count} (${o.percentage}%)`).join(' | ');
        doc.font(fontRegular).fillColor('#047857').text(`   => Thống kê: ${optSummary}`);
      } else if (q.question_type === 'TEXT') {
        doc.font(fontRegular).fillColor('#047857').text(`   => Có ${q.total_answers} ý kiến đóng góp tự luận đã ghi nhận.`);
      }

      doc.moveDown(0.4);
    });

    // Signature footer
    doc.moveDown(1.2);
    const bottomY = doc.y;
    doc.fontSize(9.5).font(fontBold).fillColor('#111827');
    doc.text('NGƯỜI LẬP BÁO CÁO', 60, bottomY);
    doc.text('TRƯỞNG KHOA / PHÒNG BAN', 360, bottomY);
    doc.fontSize(8.5).font(fontItalic).fillColor('#555555');
    doc.text('(Ký và ghi rõ họ tên)', 70, bottomY + 14);
    doc.text('(Ký và đóng dấu)', 390, bottomY + 14);

    doc.end();
  });
}

module.exports = { generateSurveyPdf };
