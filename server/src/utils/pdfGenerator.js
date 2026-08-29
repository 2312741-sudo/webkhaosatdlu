const PDFDocument = require('pdfkit');
const analyticsService = require('../services/analyticsService');

/**
 * Tạo tài liệu PDF báo cáo khảo sát
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

    // Header DLU
    doc.fontSize(12).font('Helvetica-Bold').text('TRUONG DAI HOC DA LAT - KHOA CONG NGHE THONG TIN', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('He thong Khao sat Muc do Hai long Sinh vien (DLU)', { align: 'center' });
    doc.moveDown(0.5);
    doc.strokeColor('#003366').lineWidth(1.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Title
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#003366')
       .text(`BAO CAO KET QUA KHAO SAT`, { align: 'center' });
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333')
       .text(survey.title.toUpperCase(), { align: 'center' });
    doc.moveDown(1);

    // Metadata
    doc.fontSize(10).font('Helvetica').fillColor('#000000');
    doc.text(`- Don vi to chuc: ${survey.faculty_name || 'Toan truong'}`);
    doc.text(`- Nguoi lap khao sat: ${survey.creator_name}`);
    doc.text(`- Tong so luot sinh vien tham gia: ${summary.total_responses} luot`);
    doc.text(`- Diem danh gia hai long trung binh: ${summary.overall_satisfaction_score} / 5.0`);
    doc.text(`- Thoi gian lam bai trung binh: ${summary.avg_completion_time_minutes} phut`);
    doc.text(`- Thoi diem xuat bao cao: ${new Date().toLocaleString('vi-VN')}`);
    doc.moveDown(1);

    // Category breakdown
    if (category_breakdown && category_breakdown.length > 0) {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#003366').text('1. DIEM TRUNG BINH THEO NHOM TIEU CHI:');
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica').fillColor('#000000');
      category_breakdown.forEach((cat, idx) => {
        doc.text(`   ${idx + 1}. ${cat.category}: ${cat.average_score} / 5.0`);
      });
      doc.moveDown(1);
    }

    // Questions detail
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#003366').text('2. KET QUA CHI TIET TUNG CAU HOI:');
    doc.moveDown(0.5);

    questions.forEach((q, idx) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#222222')
         .text(`Cau ${idx + 1}: ${q.question_text}`);
      doc.fontSize(9).font('Helvetica').fillColor('#555555')
         .text(`Loai: ${q.question_type} | Nhom: ${q.category} | So luot tra loi: ${q.total_answers}`);

      if (q.question_type === 'LIKERT_5' && q.stats) {
        doc.font('Helvetica').fillColor('#006600')
           .text(`=> Diem trung binh: ${q.stats.average_score} / 5.0 (1 sao: ${q.stats.percentages[1]}%, 2 sao: ${q.stats.percentages[2]}%, 3 sao: ${q.stats.percentages[3]}%, 4 sao: ${q.stats.percentages[4]}%, 5 sao: ${q.stats.percentages[5]}%)`);
      } else if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.question_type) && q.stats) {
        const optSummary = q.stats.options.map(o => `+ ${o.option_text}: ${o.count} (${o.percentage}%)`).join(' | ');
        doc.font('Helvetica').fillColor('#006600').text(`=> ${optSummary}`);
      } else if (q.question_type === 'TEXT') {
        doc.font('Helvetica').fillColor('#006600').text(`=> Co ${q.total_answers} y kien dong gop tu luan.`);
      }

      doc.moveDown(0.5);
    });

    // Signature footer
    doc.moveDown(1.5);
    const bottomY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
    doc.text('NGUOI LAP BAO CAO', 60, bottomY);
    doc.text('TRUONG KHOA / PHONG BAN', 360, bottomY);
    doc.fontSize(9).font('Helvetica').text('(Ky va ghi ro ho ten)', 75, bottomY + 15);
    doc.text('(Ky va dong dau)', 390, bottomY + 15);

    doc.end();
  });
}

module.exports = { generateSurveyPdf };
