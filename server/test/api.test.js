const assert = require('assert');
const { seed } = require('../src/seeders/seedData');
const authService = require('../src/services/authService');
const surveyService = require('../src/services/surveyService');
const questionService = require('../src/services/questionService');
const responseService = require('../src/services/responseService');
const analyticsService = require('../src/services/analyticsService');
const userService = require('../src/services/userService');
const { generateSurveyExcel } = require('../src/utils/excelGenerator');
const { generateSurveyPdf } = require('../src/utils/pdfGenerator');
const db = require('../src/config/db');

async function expectError(fn, statusCode) {
  try {
    await fn();
  } catch (err) {
    assert.strictEqual(err.statusCode, statusCode, `Mong đợi lỗi ${statusCode}, nhận được: ${err.statusCode} - ${err.message}`);
    return err;
  }
  assert.fail(`Mong đợi lỗi ${statusCode} nhưng thao tác lại thành công`);
}

async function runTests() {
  console.log('🧪 Bắt đầu chạy bộ kiểm thử Backend DLU Survey...\n');

  // 1. Reset and seed database
  seed();
  console.log('✅ Bước 1: Khởi tạo dữ liệu kiểm thử (Seed) thành công.\n');

  // 2. Test Auth Module
  console.log('👉 Kiểm tra Module 1: Xác thực & Phân quyền chuẩn DLU...');
  
  // Test admin login
  const adminAuth = await authService.login('admin@dlu.edu.vn', 'admin123');
  assert(adminAuth.token, 'Admin phải nhận được JWT token');
  assert.strictEqual(adminAuth.user.role, 'ADMIN', 'Vai trò phải là ADMIN');
  console.log('  - Đăng nhập Admin thành công');

  // Test staff login
  const staffAuth = await authService.login('canbo.cntt@dlu.edu.vn', 'canbo123');
  assert.strictEqual(staffAuth.user.role, 'STAFF', 'Vai trò phải là STAFF');
  console.log('  - Đăng nhập Cán bộ thành công');

  // Test student login with student code
  const studentAuth = await authService.login('2111234', '123456');
  assert.strictEqual(studentAuth.user.role, 'STUDENT', 'Vai trò phải là STUDENT');
  assert.strictEqual(studentAuth.user.studentCode, '2111234', 'Mã sinh viên chính xác');
  console.log('  - Đăng nhập Sinh viên bằng Mã SV thành công');

  // Mật khẩu "123456" không còn là chìa khóa vạn năng
  await expectError(() => authService.login('admin@dlu.edu.vn', '123456'), 401);
  await expectError(() => authService.login('canbo.cntt@dlu.edu.vn', 'dlu123456'), 401);
  const adminStillWorks = await authService.login('admin@dlu.edu.vn', 'admin123');
  assert.strictEqual(adminStillWorks.user.role, 'ADMIN', 'Mật khẩu Admin không bị ghi đè');
  console.log('  - Chặn đăng nhập Admin / Cán bộ bằng mật khẩu mặc định 123456');

  // Không tự tạo tài khoản qua form mật khẩu với MSSV bất kỳ
  await expectError(() => authService.login('2211999@dlu.edu.vn', '123456'), 401);
  console.log('  - Không tự cấp tài khoản khi đăng nhập bằng MSSV chưa tồn tại');

  // Google SSO: gửi email trần (không có token Google) phải bị từ chối
  delete process.env.ALLOW_DEV_GOOGLE_LOGIN;
  await expectError(() => authService.loginWithDluGoogle({ email: 'admin@dlu.edu.vn' }), 401);
  await expectError(() => authService.loginWithDluGoogle({ email: '2311888@dlu.edu.vn', fullName: 'Nguyễn Thị Hoa' }), 401);
  console.log('  - Chặn giả mạo Google SSO bằng cách chỉ gửi email');

  // Google SSO với token đã được Google xác minh (giả lập kết quả xác minh)
  const originalVerify = authService.verifyGoogleToken;
  let verifiedEmail = '2311888@dlu.edu.vn';
  authService.verifyGoogleToken = async () => ({ email: verifiedEmail, name: 'Nguyễn Thị Hoa' });

  const googleDluAuth = await authService.loginWithDluGoogle({ idToken: 'verified-token' });
  assert(googleDluAuth.token);
  assert.strictEqual(googleDluAuth.user.studentCode, '2311888');
  assert.strictEqual(googleDluAuth.user.academicYear, 'K47');
  assert.strictEqual(googleDluAuth.user.role, 'STUDENT');
  console.log('  - Đăng nhập Google Workspace DLU (@dlu.edu.vn) với token hợp lệ thành công');

  verifiedEmail = 'test@gmail.com';
  await expectError(() => authService.loginWithDluGoogle({ idToken: 'verified-token' }), 400);
  console.log('  - Chặn email ngoài trường (@gmail.com) chính xác');

  verifiedEmail = 'nguoila@dlu.edu.vn';
  await expectError(() => authService.loginWithDluGoogle({ idToken: 'verified-token' }), 403);
  console.log('  - Không tự cấp quyền Cán bộ cho email không phải sinh viên');
  authService.verifyGoogleToken = originalVerify;

  // Chế độ demo cục bộ: chỉ vào được tài khoản sinh viên
  process.env.ALLOW_DEV_GOOGLE_LOGIN = 'true';
  await expectError(() => authService.loginWithDluGoogle({ email: 'admin@dlu.edu.vn' }), 403);
  const devStudent = await authService.loginWithDluGoogle({ email: '2211236@dlu.edu.vn' });
  assert.strictEqual(devStudent.user.role, 'STUDENT');
  delete process.env.ALLOW_DEV_GOOGLE_LOGIN;
  console.log('  - Chế độ demo Google chỉ áp dụng cho tài khoản sinh viên');

  // Test wrong password
  try {
    await authService.login('admin@dlu.edu.vn', 'wrongpass');
    assert.fail('Đăng nhập sai mật khẩu phải ném lỗi');
  } catch (err) {
    assert.strictEqual(err.statusCode, 401);
    console.log('  - Bắt lỗi sai mật khẩu chính xác');
  }
  console.log('✅ Module 1 PASS!\n');

  // 3. Test Survey Management Module
  console.log('👉 Kiểm tra Module 2: Quản lý Phiếu khảo sát & Câu hỏi...');
  
  const newSurvey = await surveyService.createSurvey({
    title: 'Khảo sát kiểm thử tự động 2026',
    description: 'Mô tả bài test',
    start_time: '2026-01-01 00:00:00',
    end_time: '2026-12-31 23:59:59',
    targets: [{ target_type: 'FACULTY', target_value: 'CNTT' }]
  }, staffAuth.user);

  assert(newSurvey.id, 'Phải tạo được khảo sát mới');
  assert.strictEqual(newSurvey.status, 'DRAFT', 'Trạng thái mặc định phải là DRAFT');
  console.log(`  - Tạo khảo sát mới thành công (ID: ${newSurvey.id})`);

  // Add Likert question
  const q1 = await questionService.createQuestion(newSurvey.id, {
    question_text: 'Mức độ hài lòng với phần mềm?',
    question_type: 'LIKERT_5',
    is_required: 1,
    category: 'Chất lượng phần mềm'
  }, staffAuth.user);
  assert.strictEqual(q1.question_type, 'LIKERT_5');

  // Add Single Choice question
  const q2 = await questionService.createQuestion(newSurvey.id, {
    question_text: 'Bạn đang dùng thiết bị gì?',
    question_type: 'SINGLE_CHOICE',
    is_required: 1,
    options: ['Laptop', 'Điện thoại di động', 'Máy tính bảng']
  }, staffAuth.user);
  assert.strictEqual(q2.options.length, 3);
  console.log('  - Thêm câu hỏi Likert và Trắc nghiệm thành công');

  // Publish survey
  await surveyService.updateSurveyStatus(newSurvey.id, 'PUBLISHED', staffAuth.user);
  const publishedSurvey = await surveyService.getSurveyDetail(newSurvey.id, staffAuth.user);
  assert.strictEqual(publishedSurvey.status, 'PUBLISHED');
  console.log('  - Phát hành (Publish) khảo sát thành công');

  // Duplicate survey
  const dupSurvey = await surveyService.duplicateSurvey(newSurvey.id, staffAuth.user);
  assert(dupSurvey.id !== newSurvey.id);
  assert.strictEqual(dupSurvey.questions.length, 2);
  assert.strictEqual(dupSurvey.status, 'DRAFT');
  console.log('  - Nhân bản khảo sát thành công');
  console.log('✅ Module 2 PASS!\n');

  // 4. Test Response & Anti-Duplicate Module
  console.log('👉 Kiểm tra Module 3: Thu thập phản hồi & Chặn nộp trùng...');
  
  // Student 8 (Dang Quoc Hung) takes survey 1
  const student8Auth = await authService.login('2311238', '123456');
  assert.strictEqual(student8Auth.user.facultyCode, 'CNTT', 'Mã khoa sinh viên phải là CNTT');

  const studentSurveys = await responseService.getStudentSurveys(student8Auth.user);
  assert(studentSurveys.length >= 2, 'Sinh viên phải thấy đầy đủ các khảo sát được phát hành (không bị ẩn chỉ còn 1 bài)');
  console.log(`  - Sinh viên truy cập thấy đầy đủ ${studentSurveys.length} khảo sát được phát hành`);
  
  const submitResult = await responseService.submitSurveyResponse(1, {
    completion_time_seconds: 120,
    answers: [
      { question_id: 1, rating_value: 5 },
      { question_id: 2, rating_value: 5 },
      { question_id: 3, rating_value: 4 },
      { question_id: 4, rating_value: 4 },
      { question_id: 5, selected_option_id: 1 },
      { question_id: 6, selected_option_ids: [5, 7] },
      { question_id: 7, text_answer: 'Phần mềm rất mượt mà và trực quan!' }
    ]
  }, student8Auth.user, '127.0.0.1');

  assert(submitResult.success, 'Nộp bài khảo sát phải thành công');
  console.log('  - Sinh viên nộp câu trả lời thành công');

  // Attempt duplicate submission
  try {
    await responseService.submitSurveyResponse(1, {
      answers: [{ question_id: 1, rating_value: 5 }]
    }, student8Auth.user, '127.0.0.1');
    assert.fail('Không được cho phép nộp bài lần 2');
  } catch (err) {
    assert.strictEqual(err.statusCode, 400);
    assert(err.message.includes('Mỗi sinh viên chỉ được nộp một lần'), 'Thông báo chặn nộp trùng chính xác');
    console.log('  - Chặn nộp bài trùng lặp hoạt động hoàn hảo');
  }

  // Cán bộ không được nộp bài (tránh làm sai lệch thống kê)
  await expectError(() => responseService.submitSurveyResponse(newSurvey.id, {
    answers: [{ question_id: q1.id, rating_value: 5 }, { question_id: q2.id, selected_option_id: q2.options[0].id }]
  }, staffAuth.user), 403);
  console.log('  - Chặn Cán bộ nộp phiếu khảo sát');

  // Kiểm tra tính hợp lệ của câu trả lời
  const student7Auth = await authService.login('2211236', '123456');
  const validSingle = { question_id: q2.id, selected_option_id: q2.options[0].id };
  await expectError(() => responseService.submitSurveyResponse(newSurvey.id, {
    answers: [{ question_id: q1.id, rating_value: 5 }, validSingle, { question_id: 1, rating_value: 1 }]
  }, student7Auth.user), 400);
  await expectError(() => responseService.submitSurveyResponse(newSurvey.id, {
    answers: [{ question_id: q1.id, rating_value: 5 }, { question_id: q2.id, selected_option_id: 1 }]
  }, student7Auth.user), 400);
  await expectError(() => responseService.submitSurveyResponse(newSurvey.id, {
    answers: [{ question_id: q1.id, rating_value: 9 }, validSingle]
  }, student7Auth.user), 400);
  await expectError(() => responseService.submitSurveyResponse(newSurvey.id, {
    answers: [{ question_id: q1.id, rating_value: 5 }, { question_id: q1.id, rating_value: 1 }, validSingle]
  }, student7Auth.user), 400);
  console.log('  - Từ chối câu hỏi / phương án của khảo sát khác, điểm Likert sai, câu trả lời trùng');

  const validSubmit = await responseService.submitSurveyResponse(newSurvey.id, {
    answers: [{ question_id: q1.id, rating_value: 4 }, validSingle]
  }, student7Auth.user, '10.0.0.1');
  assert(validSubmit.success);
  console.log('  - Câu trả lời hợp lệ vẫn được ghi nhận');

  // Khảo sát chỉ dành cho một lớp khác
  const classSurvey = await surveyService.createSurvey({
    title: 'Khảo sát riêng lớp CTK99',
    targets: [{ target_type: 'CLASS', target_value: 'CTK99' }]
  }, staffAuth.user);
  const classQ = await questionService.createQuestion(classSurvey.id, {
    question_text: 'Đánh giá chung?', question_type: 'LIKERT_5', is_required: 1
  }, staffAuth.user);
  await surveyService.updateSurveyStatus(classSurvey.id, 'PUBLISHED', staffAuth.user);

  const student8Surveys = await responseService.getStudentSurveys(student8Auth.user);
  assert(!student8Surveys.some(s => s.id === classSurvey.id), 'Sinh viên lớp khác không được thấy khảo sát riêng lớp CTK99');
  await expectError(() => responseService.getSurveyForAnswering(String(classSurvey.id), student8Auth.user), 403);
  await expectError(() => responseService.submitSurveyResponse(classSurvey.id, {
    answers: [{ question_id: classQ.id, rating_value: 5 }]
  }, student8Auth.user), 403);
  console.log('  - Chặn sinh viên xem / nộp khảo sát không dành cho lớp của mình');

  // Khảo sát ẩn danh không lưu IP
  const anonSurvey = await surveyService.createSurvey({
    title: 'Khảo sát ẩn danh', is_anonymous: 1, targets: [{ target_type: 'ALL', target_value: 'ALL' }]
  }, staffAuth.user);
  const anonQ = await questionService.createQuestion(anonSurvey.id, {
    question_text: 'Góp ý?', question_type: 'TEXT', is_required: 1
  }, staffAuth.user);
  await surveyService.updateSurveyStatus(anonSurvey.id, 'PUBLISHED', staffAuth.user);
  const anonResult = await responseService.submitSurveyResponse(anonSurvey.id, {
    answers: [{ question_id: anonQ.id, text_answer: 'Ổn' }]
  }, student8Auth.user, '10.0.0.2');
  const anonRow = db.get('SELECT ip_address FROM survey_responses WHERE id = ?', [anonResult.responseId]);
  assert.strictEqual(anonRow.ip_address, null, 'Khảo sát ẩn danh không được lưu IP');
  console.log('  - Khảo sát ẩn danh không lưu địa chỉ IP');
  console.log('✅ Module 3 PASS!\n');

  // 5. Test Analytics Module
  console.log('👉 Kiểm tra Module 4: Thống kê & Trực quan hóa dữ liệu...');
  const analytics = await analyticsService.getSurveyAnalytics(1);
  assert(analytics.summary.total_responses >= 5, 'Phải có ít nhất 5 phản hồi sau khi nộp');
  assert(analytics.summary.overall_satisfaction_score > 4.0, 'Điểm hài lòng phải được tính toán chính xác');
  assert(analytics.questions.length > 0, 'Phải có danh sách thống kê câu hỏi');
  console.log(`  - Thống kê khảo sát: Tổng ${analytics.summary.total_responses} lượt nộp, Điểm TB: ${analytics.summary.overall_satisfaction_score}/5.0`);
  console.log('✅ Module 4 PASS!\n');

  // 6. Test Reports Module
  console.log('👉 Kiểm tra Module 5: Xuất báo cáo Excel & PDF...');
  const excelWorkbook = await generateSurveyExcel(1);
  assert(excelWorkbook.worksheets.length === 2, 'File Excel phải có 2 worksheets (Tổng quan + Dữ liệu thô)');
  console.log('  - Xuất file Excel (.xlsx) 2 sheets thành công');

  const pdfBuffer = await generateSurveyPdf(1);
  assert(pdfBuffer.length > 1000, 'PDF Buffer phải có kích thước hợp lệ');
  console.log(`  - Xuất file PDF thành công (${pdfBuffer.length} bytes)`);
  console.log('✅ Module 5 PASS!\n');

  // 7. Test Admin Management Module
  console.log('👉 Kiểm tra Module 6: Quản trị Hệ thống & Nhật ký Audit...');
  const userList = await userService.getAllUsers();
  assert(userList.length >= 9, 'Phải có danh sách người dùng đầy đủ');
  
  const auditLogs = await userService.getAuditLogs();
  assert(auditLogs.length > 0, 'Phải ghi nhận được nhật ký hoạt động hệ thống');
  console.log(`  - Quản lý người dùng và Audit Log (${auditLogs.length} sự kiện) hoạt động tốt`);
  console.log('✅ Module 6 PASS!\n');

  console.log('🎉 TẤT CẢ 6 MODULE BACKEND ĐÃ ĐẠT 100% KIỂM THỬ THÀNH CÔNG!');
}

runTests().catch(err => {
  console.error('❌ LỖI KIỂM THỬ:', err);
  process.exit(1);
});
