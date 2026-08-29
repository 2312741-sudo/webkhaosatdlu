const db = require('../config/db');

function initSchema() {
  const schemaSql = `
    -- 1. Bảng Khoa / Phòng ban
    CREATE TABLE IF NOT EXISTS faculties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Bảng Người dùng (Sinh viên, Cán bộ khảo sát, Quản trị viên)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_code TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('STUDENT', 'STAFF', 'ADMIN')),
      faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
      class_name TEXT,
      academic_year TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Bảng Phiếu khảo sát
    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
      start_time DATETIME,
      end_time DATETIME,
      is_anonymous INTEGER DEFAULT 0,
      access_token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Bảng Đối tượng áp dụng của khảo sát (Khoa, Khóa, Lớp, Tất cả)
    CREATE TABLE IF NOT EXISTS survey_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
      target_type TEXT NOT NULL CHECK(target_type IN ('ALL', 'FACULTY', 'CLASS', 'ACADEMIC_YEAR')),
      target_value TEXT NOT NULL
    );

    -- 5. Bảng Câu hỏi
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'LIKERT_5', 'TEXT')),
      is_required INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      category TEXT DEFAULT 'Chung',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Bảng Tùy chọn cho câu hỏi trắc nghiệm
    CREATE TABLE IF NOT EXISTS question_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      score_value INTEGER DEFAULT NULL,
      order_index INTEGER DEFAULT 0
    );

    -- 7. Bảng Lượt nộp bài khảo sát
    CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completion_time_seconds INTEGER DEFAULT 0,
      ip_address TEXT,
      UNIQUE(survey_id, student_id)
    );

    -- 8. Bảng Câu trả lời chi tiết
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      response_id INTEGER NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      selected_option_id INTEGER REFERENCES question_options(id) ON DELETE SET NULL,
      selected_option_ids_json TEXT,
      rating_value INTEGER,
      text_answer TEXT
    );

    -- 9. Bảng Nhật ký hoạt động (Audit log)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tạo Index tăng tốc truy vấn thống kê và tìm kiếm
    CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
    CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
    CREATE INDEX IF NOT EXISTS idx_questions_survey ON questions(survey_id);
    CREATE INDEX IF NOT EXISTS idx_responses_survey ON survey_responses(survey_id);
    CREATE INDEX IF NOT EXISTS idx_responses_student ON survey_responses(student_id);
    CREATE INDEX IF NOT EXISTS idx_answers_response ON answers(response_id);
    CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
  `;

  db.exec(schemaSql);
  console.log('✅ Database schema initialized successfully.');
}

module.exports = { initSchema };
