const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { initSchema } = require('../models/schema');

function seed() {
  console.log('🌱 Starting database seeding with authentic DLU data...');
  initSchema();

  // Reset data for clean seed
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM answers;
    DELETE FROM survey_responses;
    DELETE FROM question_options;
    DELETE FROM questions;
    DELETE FROM survey_targets;
    DELETE FROM surveys;
    DELETE FROM users;
    DELETE FROM faculties;
  `);

  // 1. Seed Faculties
  const insertFaculty = db.db.prepare('INSERT INTO faculties (id, code, name) VALUES (?, ?, ?)');
  insertFaculty.run(1, 'CNTT', 'Khoa Công nghệ Thông tin');
  insertFaculty.run(2, 'KT-QTKD', 'Khoa Kinh tế & Quản trị Kinh doanh');
  insertFaculty.run(3, 'NN', 'Khoa Ngoại ngữ');
  insertFaculty.run(4, 'TOAN', 'Khoa Toán - Tin học');

  // 2. Seed Users
  const passwordHash = bcrypt.hashSync('123456', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);
  const staffHash = bcrypt.hashSync('canbo123', 10);

  const insertUser = db.db.prepare(`
    INSERT INTO users (id, student_code, email, password_hash, full_name, role, faculty_id, class_name, academic_year, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  // Admin
  insertUser.run(1, null, 'admin@dlu.edu.vn', adminHash, 'Quản trị viên Hệ thống DLU', 'ADMIN', null, null, null);

  // Staff (Cán bộ)
  insertUser.run(2, null, 'canbo.cntt@dlu.edu.vn', staffHash, 'ThS. Nguyễn Văn Hải (Trợ lý Đào tạo CNTT)', 'STAFF', 1, null, null);
  insertUser.run(3, null, 'canbo.dbcl@dlu.edu.vn', staffHash, 'Trần Thị Thu Hà (Phòng Đảm bảo Chất lượng)', 'STAFF', null, null, null);

  // Students K45 (Năm 4 - Nhập học 2021)
  insertUser.run(4, '2111234', '2111234@dlu.edu.vn', passwordHash, 'Trần Văn An', 'STUDENT', 1, 'CTK45', 'K45');
  insertUser.run(5, '2111235', '2111235@dlu.edu.vn', passwordHash, 'Lê Thị Bích', 'STUDENT', 1, 'CTK45', 'K45');
  insertUser.run(6, '2111240', '2111240@dlu.edu.vn', passwordHash, 'Nguyễn Hoàng Long', 'STUDENT', 1, 'CTK45', 'K45');

  // Students K46 (Năm 3 - Nhập học 2022)
  insertUser.run(7, '2211236', '2211236@dlu.edu.vn', passwordHash, 'Phạm Minh Cường', 'STUDENT', 1, 'CTK46', 'K46');
  insertUser.run(8, '2211237', '2211237@dlu.edu.vn', passwordHash, 'Hoàng Thị Dung', 'STUDENT', 1, 'CTK46', 'K46');
  insertUser.run(9, '2211250', '2211250@dlu.edu.vn', passwordHash, 'Trần Đức Trọng', 'STUDENT', 1, 'CTK46', 'K46');

  // Students K47 (Năm 2 - Nhập học 2023)
  insertUser.run(10, '2311238', '2311238@dlu.edu.vn', passwordHash, 'Đặng Quốc Hùng', 'STUDENT', 1, 'CTK47', 'K47');
  insertUser.run(11, '2311239', '2311239@dlu.edu.vn', passwordHash, 'Vũ Mai Linh', 'STUDENT', 1, 'CTK47', 'K47');
  insertUser.run(12, '2311260', '2311260@dlu.edu.vn', passwordHash, 'Bùi Ngọc Anh', 'STUDENT', 1, 'CTK47', 'K47');

  // Students K48 (Năm 1 - Nhập học 2024)
  insertUser.run(13, '2411270', '2411270@dlu.edu.vn', passwordHash, 'Nguyễn Trọng Phúc', 'STUDENT', 1, 'CTK48', 'K48');
  insertUser.run(14, '2411271', '2411271@dlu.edu.vn', passwordHash, 'Đỗ Phương Thảo', 'STUDENT', 1, 'CTK48', 'K48');

  // 3. Seed Surveys
  const insertSurvey = db.db.prepare(`
    INSERT INTO surveys (id, title, description, created_by, faculty_id, status, start_time, end_time, is_anonymous, access_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Survey 1: Active published survey
  insertSurvey.run(
    1,
    'Khảo sát mức độ hài lòng về chất lượng đào tạo & cơ sở vật chất HK1 (2025 - 2026)',
    'Khảo sát thường niên của Khoa Công nghệ Thông tin - Trường Đại học Đà Lạt nhằm ghi nhận ý kiến đóng góp của sinh viên về điều kiện giảng dạy, trang thiết bị phòng máy và chất lượng hỗ trợ sinh viên.',
    2,
    1,
    'PUBLISHED',
    '2025-09-01 00:00:00',
    '2026-12-31 23:59:59',
    0,
    'dlu-cntt-hk1-2025'
  );

  // Survey 2: Library & Study space survey
  insertSurvey.run(
    2,
    'Khảo sát ý kiến sinh viên về dịch vụ Thư viện và Không gian Tự học DLU',
    'Khảo sát đánh giá mức độ hài lòng đối với hệ thống thư viện, phòng tự học, nguồn tài liệu số và thái độ phục vụ tại Trường Đại học Đà Lạt.',
    3,
    null,
    'PUBLISHED',
    '2025-10-01 00:00:00',
    '2026-12-31 23:59:59',
    0,
    'dlu-thuvien-2025'
  );

  // Survey 3: Draft survey
  insertSurvey.run(
    3,
    'Khảo sát nhu cầu tham gia IT Job Fair và Câu lạc bộ Tin học 2026',
    'Phiếu thăm dò nguyện vọng tham gia hội thảo hướng nghiệp và chuyên đề kỹ năng thực chiến dành cho sinh viên IT.',
    2,
    1,
    'DRAFT',
    '2026-09-01 00:00:00',
    '2026-10-15 23:59:59',
    0,
    'dlu-jobfair-2026-draft'
  );

  // 4. Seed Survey Targets
  const insertTarget = db.db.prepare(`
    INSERT INTO survey_targets (survey_id, target_type, target_value)
    VALUES (?, ?, ?)
  `);
  insertTarget.run(1, 'FACULTY', 'CNTT');
  insertTarget.run(2, 'ALL', 'ALL');
  insertTarget.run(3, 'FACULTY', 'CNTT');

  // 5. Seed Questions for Survey 1
  const insertQuestion = db.db.prepare(`
    INSERT INTO questions (id, survey_id, question_text, question_type, is_required, order_index, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertQuestion.run(1, 1, 'Phòng máy thực hành (A27, A28) có cấu hình và đường truyền mạng đáp ứng tốt nội dung môn học?', 'LIKERT_5', 1, 1, 'Cơ sở vật chất');
  insertQuestion.run(2, 1, 'Giảng viên cung cấp đề cương chi tiết và tài liệu học tập đầy đủ trước khi bắt đầu môn học?', 'LIKERT_5', 1, 2, 'Hoạt động giảng dạy');
  insertQuestion.run(3, 1, 'Mức độ hài lòng chung về sự nhiệt tình và hỗ trợ giải đáp thắc mắc của giảng viên Khoa CNTT?', 'LIKERT_5', 1, 3, 'Hoạt động giảng dạy');
  insertQuestion.run(4, 1, 'Cán bộ văn phòng Khoa hỗ trợ giải quyết các thủ tục hành chính nhanh chóng và tận tình?', 'LIKERT_5', 1, 4, 'Dịch vụ hỗ trợ');
  insertQuestion.run(5, 1, 'Kênh tiếp nhận thông tin đào tạo mà bạn thấy thuận tiện và hiệu quả nhất?', 'SINGLE_CHOICE', 1, 5, 'Thông tin liên lạc');
  insertQuestion.run(6, 1, 'Bạn mong muốn Khoa mở thêm các khóa bồi dưỡng/chuyên đề nào trong học kỳ tới?', 'MULTIPLE_CHOICE', 0, 6, 'Đào tạo & Kỹ năng');
  insertQuestion.run(7, 1, 'Đóng góp ý kiến hoặc đề xuất khác của bạn nhằm nâng cao chất lượng đào tạo của Khoa?', 'TEXT', 0, 7, 'Góp ý tự luận');

  // 6. Seed Options for Questions 5 & 6
  const insertOption = db.db.prepare(`
    INSERT INTO question_options (id, question_id, option_text, score_value, order_index)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Options for Question 5 (Single choice)
  insertOption.run(1, 5, 'Website Khoa & Cổng thông tin Trường', 0, 1);
  insertOption.run(2, 5, 'Nhóm Zalo / Facebook cán bộ lớp', 0, 2);
  insertOption.run(3, 5, 'Email sinh viên định dạng @dlu.edu.vn', 0, 3);
  insertOption.run(4, 5, 'Bảng tin tại sảnh Nhà A28', 0, 4);

  // Options for Question 6 (Multiple choice)
  insertOption.run(5, 6, 'Trí tuệ nhân tạo (AI) & Học máy (Machine Learning)', 0, 1);
  insertOption.run(6, 6, 'Điện toán đám mây & CI/CD DevOps (AWS / Docker)', 0, 2);
  insertOption.run(7, 6, 'Lập trình ứng dụng di động Flutter / React Native', 0, 3);
  insertOption.run(8, 6, 'Kỹ năng viết CV, phỏng vấn và tác phong doanh nghiệp', 0, 4);
  insertOption.run(9, 6, 'An toàn thông tin mạng & Kiểm thử bảo mật (Pentest)', 0, 5);

  // Questions for Survey 2 (Library)
  insertQuestion.run(8, 2, 'Không gian tự học tại Thư viện DLU yên tĩnh, thoáng mát và đủ ánh sáng?', 'LIKERT_5', 1, 1, 'Cơ sở vật chất');
  insertQuestion.run(9, 2, 'Nguồn tài liệu giáo trình và sách tham khảo chuyên ngành phong phú, dễ tra cứu?', 'LIKERT_5', 1, 2, 'Học liệu');
  insertQuestion.run(10, 2, 'Bạn thường sử dụng Thư viện DLU vào khoảng thời gian nào nhiều nhất?', 'SINGLE_CHOICE', 1, 3, 'Thói quen');
  insertQuestion.run(11, 2, 'Ý kiến đóng góp để nâng cao trải nghiệm tại Thư viện:', 'TEXT', 0, 4, 'Góp ý');

  insertOption.run(10, 10, 'Buổi sáng (7h30 - 11h30)', 0, 1);
  insertOption.run(11, 10, 'Buổi chiều (13h30 - 17h00)', 0, 2);
  insertOption.run(12, 10, 'Buổi tối các ngày trong tuần', 0, 3);
  insertOption.run(13, 10, 'Cuối tuần (Thứ 7 - Chủ nhật)', 0, 4);

  // 7. Seed Sample Responses for Survey 1
  const insertResponse = db.db.prepare(`
    INSERT INTO survey_responses (id, survey_id, student_id, submitted_at, completion_time_seconds, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAnswer = db.db.prepare(`
    INSERT INTO answers (response_id, question_id, selected_option_id, selected_option_ids_json, rating_value, text_answer)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Response 1 - Tran Van An (CTK45)
  insertResponse.run(1, 1, 4, '2026-08-10 09:30:00', 185, '127.0.0.1');
  insertAnswer.run(1, 1, null, null, 5, null);
  insertAnswer.run(1, 2, null, null, 5, null);
  insertAnswer.run(1, 3, null, null, 5, null);
  insertAnswer.run(1, 4, null, null, 4, null);
  insertAnswer.run(1, 5, 2, null, null, null);
  insertAnswer.run(1, 6, null, JSON.stringify([5, 6]), null, null);
  insertAnswer.run(1, 7, null, null, null, 'Khoa nên nâng cấp thêm điều hòa và chuột bàn phím cho phòng máy A28 tầng 2.');

  // Response 2 - Le Thi Bich (CTK45)
  insertResponse.run(2, 1, 5, '2026-08-12 14:15:00', 210, '127.0.0.1');
  insertAnswer.run(2, 1, null, null, 4, null);
  insertAnswer.run(2, 2, null, null, 5, null);
  insertAnswer.run(2, 3, null, null, 4, null);
  insertAnswer.run(2, 4, null, null, 5, null);
  insertAnswer.run(2, 5, 3, null, null, null);
  insertAnswer.run(2, 6, null, JSON.stringify([5, 8]), null, null);
  insertAnswer.run(2, 7, null, null, null, 'Thầy cô Khoa CNTT giảng dạy rất nhiệt huyết và tận tình hướng dẫn đồ án.');

  // Response 3 - Pham Minh Cuong (CTK46)
  insertResponse.run(3, 1, 7, '2026-08-15 16:40:00', 160, '127.0.0.1');
  insertAnswer.run(3, 1, null, null, 4, null);
  insertAnswer.run(3, 2, null, null, 4, null);
  insertAnswer.run(3, 3, null, null, 5, null);
  insertAnswer.run(3, 4, null, null, 4, null);
  insertAnswer.run(3, 5, 2, null, null, null);
  insertAnswer.run(3, 6, null, JSON.stringify([6, 7, 9]), null, null);
  insertAnswer.run(3, 7, null, null, null, 'Mong muốn có thêm nhiều buổi workshop kỹ năng thực tế với các chuyên gia từ doanh nghiệp.');

  // Response 4 - Hoang Thi Dung (CTK46)
  insertResponse.run(4, 1, 8, '2026-08-18 10:05:00', 195, '127.0.0.1');
  insertAnswer.run(4, 1, null, null, 5, null);
  insertAnswer.run(4, 2, null, null, 4, null);
  insertAnswer.run(4, 3, null, null, 5, null);
  insertAnswer.run(4, 4, null, null, 5, null);
  insertAnswer.run(4, 5, 1, null, null, null);
  insertAnswer.run(4, 6, null, JSON.stringify([5, 6, 7]), null, null);
  insertAnswer.run(4, 7, null, null, null, 'Các bài giảng thực hành rất bổ ích, mong khoa tiếp tục duy trì và phát triển.');

  // 8. Seed Audit Logs
  const insertAudit = db.db.prepare(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAudit.run(1, 'INITIALIZE_SYSTEM', 'SYSTEM', '1', 'Khởi tạo hệ thống khảo sát DLU');
  insertAudit.run(2, 'CREATE_SURVEY', 'SURVEY', '1', 'Tạo khảo sát chất lượng đào tạo HK1');
  insertAudit.run(2, 'PUBLISH_SURVEY', 'SURVEY', '1', 'Phát hành khảo sát chất lượng đào tạo HK1');

  console.log('✅ Seed data successfully created:');
  console.log(' - 4 Khoa / Phòng ban');
  console.log(' - 14 Người dùng mẫu có đầy đủ Họ và Tên sinh viên các khóa:');
  console.log('    + Admin: admin@dlu.edu.vn (Pass: admin123) - Quản trị viên');
  console.log('    + Cán bộ CNTT: canbo.cntt@dlu.edu.vn (Pass: canbo123) - ThS. Nguyễn Văn Hải');
  console.log('    + Cán bộ ĐBCL: canbo.dbcl@dlu.edu.vn (Pass: canbo123) - Trần Thị Thu Hà');
  console.log('    + Sinh viên K45: 2111234@dlu.edu.vn - Trần Văn An (Lớp CTK45)');
  console.log('    + Sinh viên K45: 2111235@dlu.edu.vn - Lê Thị Bích (Lớp CTK45)');
  console.log('    + Sinh viên K45: 2111240@dlu.edu.vn - Nguyễn Hoàng Long (Lớp CTK45)');
  console.log('    + Sinh viên K46: 2211236@dlu.edu.vn - Phạm Minh Cường (Lớp CTK46)');
  console.log('    + Sinh viên K46: 2211237@dlu.edu.vn - Hoàng Thị Dung (Lớp CTK46)');
  console.log('    + Sinh viên K47: 2311238@dlu.edu.vn - Đặng Quốc Hùng (Lớp CTK47)');
  console.log('    + Sinh viên K47: 2311239@dlu.edu.vn - Vũ Mai Linh (Lớp CTK47)');
  console.log('    + Sinh viên K48: 2411270@dlu.edu.vn - Nguyễn Trọng Phúc (Lớp CTK48)');
  console.log('    + Sinh viên K48: 2411271@dlu.edu.vn - Đỗ Phương Thảo (Lớp CTK48)');
  console.log('    + Mật khẩu tất cả sinh viên: 123456');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
