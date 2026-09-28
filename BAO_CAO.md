TRƯỜNG ĐẠI HỌC ĐÀ LẠT
KHOA CÔNG NGHỆ THÔNG TIN
────────── ✦ ──────────

BÁO CÁO CHUYÊN NGÀNH
XÂY DỰNG WEBSITE KHẢO SÁT
MỨC ĐỘ HÀI LÒNG CỦA SINH VIÊN
TRƯỜNG ĐẠI HỌC ĐÀ LẠT

Giảng viên hướng dẫn: ThS. Trần Thị Phương Linh
Sinh viên thực hiện:
  1. 2312800 – Võ Công Vinh
  2. 2312741 – Nguyễn Thanh Tâm
  3. 2312774 – Nguyễn Đức Tín

Đà Lạt, tháng 9 năm 2026

────────────────────────────────────────────────────────────

MỤC LỤC
CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI	1
1.1. Bối cảnh và lý do chọn đề tài	1
1.2. Mục tiêu đề tài	1
1.3. Phạm vi và dữ liệu thực nghiệm	1
CHƯƠNG 2. CÔNG NGHỆ VÀ KIẾN TRÚC HỆ THỐNG	2
2.1. Công nghệ sử dụng và môi trường triển khai	2
2.2. Kiến trúc phân tầng phía máy chủ (Layered Architecture)	2
2.3. Tổ chức và điều hướng phía giao diện (Frontend)	3
CHƯƠNG 3. THIẾT KẾ CƠ SỞ DỮ LIỆU	4
3.1. Mô hình thực thể mối kết hợp (ERD) và chuẩn hóa 3NF	4
3.2. Danh mục các bảng và ràng buộc toàn vẹn	4
CHƯƠNG 4. CÁC PHÂN HỆ VÀ CHỨC NĂNG CHÍNH	5
4.1. Phân hệ sinh viên (Student Portal)	5
4.2. Phân hệ cán bộ khảo sát (Staff Management)	5
4.3. Phân hệ quản trị hệ thống (Admin & Audit Logs)	6
CHƯƠNG 5. CÁC MẪU THIẾT KẾ ÁP DỤNG	7
5.1. Kiến trúc phân tầng (Layered Architecture)	7
5.2. Mẫu Singleton (Single Instance)	7
5.3. Mẫu Facade (Giao diện đơn giản hóa CSDL)	7
5.4. Mẫu Chain of Responsibility (Chuỗi xử lý Middleware)	7
5.5. Mẫu Factory Function (Khởi tạo Middleware RBAC)	8
5.6. Mẫu Provider và Observer ở phía giao diện React	8
CHƯƠNG 6. RÀ SOÁT, TỐI ƯU VÀ KHẮC PHỤC LỖI	9
6.1. Các lỗ hổng bảo mật và giải pháp xử lý	9
6.2. Các lỗi logic nghiệp vụ và tối ưu trải nghiệm người dùng	10
6.3. Tối ưu triển khai Cloud (Vercel & Render, CORS, Cold Start)	12
CHƯƠNG 7. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG	14
7.1. Kiểm thử tự động (Automated Testing Suite)	14
7.2. Kiểm thử thủ công và kiểm thử tích hợp HTTP/CORS	15
CHƯƠNG 8. HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN	16
CHƯƠNG 9. KẾT LUẬN	17
TÀI LIỆU THAM KHẢO	18

────────────────────────────────────────────────────────────

CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI

1.1. Bối cảnh và lý do chọn đề tài
Trong công tác đảm bảo chất lượng giáo dục đại học, việc khảo sát ý kiến phản hồi của người học về chương trình đào tạo, hoạt động giảng dạy của giảng viên, cơ sở vật chất và dịch vụ hỗ trợ sinh viên là một nhiệm vụ định kỳ mang tính bắt buộc. Tại Trường Đại học Đà Lạt (DLU), phương thức khảo sát truyền thống bằng phiếu in giấy hoặc phân tán qua nhiều biểu mẫu Google Forms bộc lộ nhiều hạn chế:
- Tốn kém thời gian in ấn, phân phát và nhập liệu thủ công.
- Dễ xảy ra sai sót khi cán bộ phải tổng hợp số liệu từ nhiều nguồn vào bảng tính Excel.
- Khó kiểm soát việc sinh viên nộp trùng bài hoặc những người không thuộc đối tượng khảo sát vẫn có thể tham gia điền phiếu.
- Thiếu tính đồng bộ và nhận diện thương hiệu chung của Nhà trường.

Xuất phát từ thực tế đó, nhóm chúng em lựa chọn đề tài: "Xây dựng website khảo sát mức độ hài lòng của sinh viên Trường Đại học Đà Lạt". Hệ thống được thiết kế hướng tới việc tự động hóa toàn bộ quy trình: từ tạo lập phiếu khảo sát, phân phối qua mã QR và liên kết trực tuyến, kiểm soát sinh viên chỉ nộp đúng một lần, đến tổng hợp số liệu thời gian thực bằng biểu đồ trực quan và xuất báo cáo hành chính chuẩn hóa (Excel, PDF).

Báo cáo chuyên ngành này trình bày chi tiết về kiến trúc hệ thống, cơ sở dữ liệu, việc áp dụng các mẫu thiết kế (Design Patterns) chuẩn mực trong công nghệ phần mềm, cùng quá trình rà soát, vá các lỗ hổng bảo mật và tối ưu hóa hệ thống khi triển khai thực tế trên môi trường Cloud.

1.2. Mục tiêu đề tài
- Xây dựng một ứng dụng Web full-stack hoàn chỉnh, có giao diện hiện đại theo tông màu nhận diện thương hiệu Trường Đại học Đà Lạt.
- Phân quyền chặt chẽ theo 3 vai trò: Quản trị viên (ADMIN), Cán bộ khảo sát (STAFF) và Sinh viên (STUDENT).
- Hỗ trợ đa dạng 4 dạng câu hỏi khảo sát: Thang đo Likert 5 mức độ, trắc nghiệm 1 lựa chọn (Single Choice), trắc nghiệm nhiều lựa chọn (Multiple Choice) và câu hỏi tự luận (Text/Feedback).
- Đảm bảo tính toàn vẹn dữ liệu: Mỗi sinh viên chỉ được làm và nộp một lần duy nhất cho mỗi phiếu khảo sát (chống nộp trùng bằng Database Unique Constraint và Transaction).
- Hỗ trợ đăng nhập một chạm qua Google Workspace DLU (@dlu.edu.vn), tự động phân tích và gán thông tin sinh viên theo niên khóa và lớp học.
- Trực quan hóa dữ liệu tự động bằng các biểu đồ thống kê chuyên sâu (Chart.js) và xuất báo cáo nghiệp vụ 2 định dạng: Excel (2 sheets) và PDF chuẩn font Unicode tiếng Việt.
- Lưu vết nhật ký hoạt động (Audit Logs) phục vụ công tác thanh tra, giám sát hệ thống.

1.3. Phạm vi và dữ liệu thực nghiệm
Hệ thống được thiết kế linh hoạt, có khả năng mở rộng quy mô toàn trường nhưng được tập trung thử nghiệm sâu tại Khoa Công nghệ Thông tin. Dữ liệu mẫu (Seed Data) chuẩn hóa của hệ thống bao gồm:
- 4 Khoa / Phòng ban: Khoa Công nghệ Thông tin (CNTT), Khoa Kinh tế & Quản trị Kinh doanh (KT-QTKD), Khoa Ngoại ngữ (NN), Khoa Toán - Tin học (TOAN).
- 14 Người dùng mẫu:
  + 01 Quản trị viên hệ thống: admin@dlu.edu.vn (vai trò ADMIN).
  + 02 Cán bộ khảo sát: canbo.cntt@dlu.edu.vn (ThS. Nguyễn Văn Hải - Trợ lý Đào tạo CNTT) và canbo.dbcl@dlu.edu.vn (Trần Thị Thu Hà - Phòng Đảm bảo Chất lượng).
  + 11 Sinh viên đại diện đủ 4 khóa: K45 (2111234, 2111235, 2111240 - Lớp CTK45), K46 (2211236, 2211237, 2211250 - Lớp CTK46), K47 (2311238, 2311239, 2311260 - Lớp CTK47), K48 (2411270, 2411271 - Lớp CTK48).
- 03 Phiếu khảo sát mẫu:
  + Phiếu 1 (Đã phát hành - PUBLISHED): "Khảo sát mức độ hài lòng về chất lượng đào tạo & cơ sở vật chất HK1 (2025 - 2026)" — Áp dụng riêng cho Khoa CNTT (7 câu hỏi đủ 4 loại).
  + Phiếu 2 (Đã phát hành - PUBLISHED): "Khảo sát ý kiến sinh viên về dịch vụ Thư viện và Không gian Tự học DLU" — Áp dụng toàn trường (ALL) cho tất cả sinh viên.
  + Phiếu 3 (Bản nháp - DRAFT): "Khảo sát nhu cầu tham gia IT Job Fair và Câu lạc bộ Tin học 2026" — Dành cho cán bộ tiếp tục biên tập câu hỏi.

────────────────────────────────────────────────────────────

CHƯƠNG 2. CÔNG NGHỆ VÀ KIẾN TRÚC HỆ THỐNG

2.1. Công nghệ sử dụng và môi trường triển khai
Hệ thống được xây dựng theo mô hình Client-Server hiện đại, phân tách hoàn toàn giữa giao diện người dùng và máy chủ cung cấp dịch vụ dữ liệu qua giao thức RESTful API. Mọi phiên làm việc có bảo vệ đều sử dụng JSON Web Token (JWT) mang theo trong HTTP Header `Authorization: Bearer <token>`.

Bảng 2.1. Danh mục công nghệ chính của hệ thống
| Thành phần | Công nghệ / Thư viện | Vai trò kỹ thuật |
| :--- | :--- | :--- |
| Giao diện Frontend | React 18, Vite, Tailwind CSS, Lucide Icons | Xây dựng giao diện Single Page Application (SPA), đáp ứng đa thiết bị (Responsive Mobile/Desktop), nhận diện DLU |
| Trực quan hóa dữ liệu | Chart.js, react-chartjs-2 | Vẽ biểu đồ cột ngang cho thang đo Likert 5 mức, biểu đồ tròn/doughnut cho trắc nghiệm |
| Mã QR động | qrcode.react, qrcode | Tự động tạo mã QR dẫn trực tiếp tới phiếu khảo sát, tải ảnh PNG phục vụ in ấn poster |
| Máy chủ Backend | Node.js (≥ 20), Express 4 | Xử lý logic nghiệp vụ, xác thực, phân quyền, cung cấp RESTful API |
| Cơ sở dữ liệu | SQLite qua module `node:sqlite` (chế độ WAL) | Lưu trữ quan hệ ACID, hỗ trợ Foreign Keys ON DELETE CASCADE, Transaction đồng thời |
| Xác thực & An toàn | jsonwebtoken, bcryptjs, crypto | Ký JWT 7 ngày, băm mật khẩu 10 rounds, giải mã chuẩn hóa Google OAuth2 ID Token |
| Xuất báo cáo | ExcelJS, PDFKit | Xuất file Excel (.xlsx) 2 sheet tự động kẻ bảng định dạng và file PDF chuẩn văn bản hành chính nhúng font Roboto Unicode |
| Triển khai Cloud | Vercel (Frontend), Render (Backend) | Triển khai liên tục (CI/CD) tự động từ GitHub, hỗ trợ SSL HTTPS và phân phối toàn cầu |

2.2. Kiến trúc phân tầng phía máy chủ (Layered Architecture)
Mã nguồn Backend được tổ chức nghiêm ngặt theo mô hình 4 tầng độc lập:
1. Tầng Route (Định tuyến): Tiếp nhận yêu cầu HTTP, gắn các middleware xác thực token (`authenticateToken`), phân quyền (`authorizeRoles`) và chuyển tiếp tới Controller.
2. Tầng Controller (Điều khiển): Trích xuất tham số từ request (params, query, body), ủy quyền xử lý cho Service, sau đó định dạng dữ liệu trả về client theo cấu trúc JSON chuẩn: `{ success: true, data: ..., message: ... }`.
3. Tầng Service (Nghiệp vụ cốt lõi): Nơi tập trung toàn bộ quy tắc nghiệp vụ (Business Rules): kiểm tra điều kiện sinh viên có thuộc đối tượng khảo sát không, kiểm tra hạn mở phiếu, chống nộp trùng lặp, tính toán điểm Likert trung bình, v.v.
4. Tầng Data Access (Truy cập dữ liệu): Bao gồm `db.js` (đóng gói kết nối và hàm giao tiếp CSDL) và `schema.js` (khởi tạo cấu trúc bảng, chỉ mục và ràng buộc).

Ví dụ luồng xử lý khi nộp bài khảo sát:
Yêu cầu `POST /api/responses/take/:surveyId/submit` -> đi qua middleware kiểm tra JWT -> `ResponseController` trích xuất `req.ip` và dữ liệu trả lời -> `ResponseService` kiểm tra:
- Khảo sát có đang ở trạng thái `PUBLISHED` và trong thời hạn hợp lệ không.
- Sinh viên có thuộc đối tượng áp dụng của khảo sát (`isStudentEligible`) không.
- Sinh viên đã từng nộp bài chưa (`UNIQUE(survey_id, student_id)`).
- Tính hợp lệ của từng câu trả lời: điểm Likert phải từ 1 đến 5, câu hỏi/phương án phải thuộc đúng phiếu khảo sát đó.
Toàn bộ thao tác lưu bản ghi nộp bài (`survey_responses`) và câu trả lời chi tiết (`answers`) được thực thi trong một Database Transaction duy nhất. Nếu có bất kỳ lỗi nào, hệ thống tự động Rollback và trả về thông báo lỗi thân thiện qua middleware `errorHandler`.

2.3. Tổ chức và điều hướng phía giao diện (Frontend)
Frontend được xây dựng bằng React 18 và Vite, chia thành 12 trang chức năng chính quản lý qua React Router:
- Nhóm Xác thực: `LoginPage` (đăng nhập thông thường và Google SSO DLU), `GoogleCallbackPage` (tiếp nhận callback OAuth từ Google).
- Nhóm Sinh viên: `StudentSurveysPage` (danh sách khảo sát sinh viên được tham gia), `TakeSurveyPage` (giao diện làm bài khảo sát tối ưu cho smartphone), `SurveySuccessPage` (màn hình cảm ơn sau khi hoàn tất).
- Nhóm Cán bộ: `SurveyListPage` (quản lý danh sách khảo sát của khoa/đơn vị), `SurveyEditorPage` (tạo/chỉnh sửa thông tin, thời hạn và đối tượng áp dụng), `QuestionBuilderPage` (trình tạo câu hỏi tương tác).
- Nhóm Thống kê & Báo cáo: `SurveyAnalyticsPage` (bảng điều khiển trực quan hóa biểu đồ, tính điểm trung bình và xuất Excel/PDF), `SurveyHistoryPage` (lịch sử phản hồi chi tiết).
- Nhóm Quản trị: `UserManagementPage` (quản lý người dùng, khóa/mở khóa tài khoản), `AuditLogPage` (nhật ký kiểm toán toàn hệ thống).

Trạng thái phiên đăng nhập được duy trì tập trung qua `AuthContext` và đồng bộ bền vững với `localStorage`. Các thông báo tương tác (thành công, cảnh báo, lỗi) được điều phối thông qua `ToastContext`. Tất cả các lệnh gọi API đều đi qua instance Axios duy nhất tại `api.js`, nơi tự động gắn JWT Header và xử lý timeout 60 giây khi Backend Render khởi động từ trạng thái ngủ.

────────────────────────────────────────────────────────────

CHƯƠNG 3. THIẾT KẾ CƠ SỞ DỮ LIỆU

3.1. Mô hình thực thể mối kết hợp (ERD) và chuẩn hóa 3NF
Cơ sở dữ liệu của hệ thống gồm 9 bảng được chuẩn hóa đạt dạng chuẩn 3 (3NF), loại bỏ hoàn toàn các dị thường dư thừa dữ liệu (insertion, update, deletion anomalies).

Bảng 3.1. Danh mục các bảng trong cơ sở dữ liệu
| Tên bảng | Chức năng lưu trữ dữ liệu |
| :--- | :--- |
| `faculties` | Danh mục các Khoa, Phòng ban trong toàn trường (Mã khoa, Tên khoa) |
| `users` | Tài khoản người dùng (ADMIN, STAFF, STUDENT), kèm MSSV, email, mật khẩu băm, lớp, khóa, trạng thái kích hoạt |
| `surveys` | Thông tin phiếu khảo sát: tiêu đề, mô tả, trạng thái (DRAFT, PUBLISHED, CLOSED), thời gian mở/đóng, cờ ẩn danh, mã token QR |
| `survey_targets` | Quy định phạm vi đối tượng áp dụng của khảo sát: toàn trường (ALL), theo khoa (FACULTY), theo lớp (CLASS) hoặc theo khóa (ACADEMIC_YEAR) |
| `questions` | Ngân hàng câu hỏi: nội dung câu hỏi, loại câu hỏi (LIKERT_5, SINGLE_CHOICE, MULTIPLE_CHOICE, TEXT), danh mục tiêu chí, cờ bắt buộc, thứ tự sắp xếp |
| `question_options` | Danh sách phương án lựa chọn cho các câu hỏi trắc nghiệm |
| `survey_responses` | Bản ghi một lượt nộp bài của sinh viên cho một phiếu khảo sát (kèm thời gian hoàn thành, địa chỉ IP) |
| `answers` | Chi tiết câu trả lời của từng câu hỏi trong mỗi lượt nộp |
| `audit_logs` | Nhật ký ghi vết hoạt động: người thực hiện, hành vi (Action), đối tượng tác động (Entity) và chi tiết thời gian |

3.2. Ràng buộc toàn vẹn và Chỉ mục hiệu năng
1. Chống nộp bài trùng lặp tuyệt đối: Bảng `survey_responses` được thiết lập ràng buộc duy nhất `UNIQUE(survey_id, student_id)`. Kể cả khi có lỗi logic phía client hoặc người dùng nhấn nút gửi 2 lần liên tiếp, tầng cơ sở dữ liệu vẫn đóng vai trò là chốt chặn cuối cùng ngăn chặn nộp trùng.
2. Ràng buộc khóa ngoại an toàn:
   - Các bảng phụ thuộc chặt chẽ như `questions`, `survey_targets`, `survey_responses` sử dụng `ON DELETE CASCADE`: khi một phiếu khảo sát bị xóa, toàn bộ câu hỏi và kết quả đi kèm được dọn dẹp sạch sẽ.
   - Bảng `users` liên kết với `survey_responses` sử dụng `ON DELETE SET NULL`: khi một tài khoản sinh viên tốt nghiệp hoặc bị xóa khỏi hệ thống, dữ liệu phản hồi khảo sát trước đó vẫn được giữ lại để không làm sai lệch số liệu thống kê lịch sử của Nhà trường.
3. Chỉ mục (Indexes) tối ưu hóa truy vấn:
   - `idx_surveys_status`: Tăng tốc lọc danh sách khảo sát đang mở.
   - `idx_questions_survey`: Tăng tốc tải toàn bộ câu hỏi của một phiếu khảo sát.
   - `idx_responses_survey` & `idx_responses_student`: Tối ưu hóa việc đếm và kiểm tra sinh viên đã nộp bài hay chưa.
   - `idx_answers_response` & `idx_answers_question`: Tối ưu hóa phép tính thống kê tổng hợp và xuất dữ liệu báo cáo.

────────────────────────────────────────────────────────────

CHƯƠNG 4. CÁC PHÂN HỆ VÀ CHỨC NĂNG CHÍNH

4.1. Phân hệ sinh viên (Student Portal)
- Đăng nhập linh hoạt: Sinh viên có thể đăng nhập bằng tài khoản/MSSV do trường cấp hoặc đăng nhập một chạm qua tài khoản Google Workspace DLU (@dlu.edu.vn).
- Danh sách khảo sát được cá nhân hóa: Hệ thống tự động đối chiếu thông tin cá nhân của sinh viên (Khoa, Lớp, Khóa) với phạm vi của từng khảo sát. Sinh viên chỉ nhìn thấy và được làm những phiếu dành riêng cho mình hoặc phiếu mở cho toàn trường.
- Giao diện làm bài trực quan, tương thích di động:
  + Thang đo Likert 5 mức độ được hiển thị dạng nút chọn trực quan từ "Hoàn toàn không đồng ý" (1 sao/điểm) đến "Hoàn toàn đồng ý" (5 sao/điểm).
  + Câu hỏi trắc nghiệm một lựa chọn dạng radio button, trắc nghiệm nhiều lựa chọn dạng checkbox.
  + Câu hỏi tự luận có đếm ký tự và tự động co giãn kích thước.
- Bảo vệ khảo sát ẩn danh: Nếu phiếu được đánh dấu là khảo sát ẩn danh, hệ thống hoàn toàn không lưu địa chỉ IP và mã người dùng vào bản ghi phản hồi, giúp sinh viên yên tâm đóng góp ý kiến trung thực.
- Cập nhật thông tin cá nhân: Cho phép sinh viên xem và cập nhật Họ tên, Lớp, Khóa học của mình trực tiếp từ thanh điều hướng.

4.2. Phân hệ cán bộ khảo sát (Staff Management)
- Quản lý vòng đời phiếu khảo sát: Tạo mới, cập nhật thông tin, thiết lập thời gian bắt đầu/kết thúc, chọn đối tượng áp dụng (Toàn trường, theo Khoa, theo Lớp, theo Khóa học) và quản lý 3 trạng thái: Bản nháp (`DRAFT`), Đã phát hành (`PUBLISHED`), Đã đóng (`CLOSED`).
- Trình soạn thảo câu hỏi linh hoạt (Question Builder): Cho phép thêm mới, chỉnh sửa, xóa và thay đổi thứ tự các câu hỏi. Phân nhóm câu hỏi theo các tiêu chí đánh giá (Cơ sở vật chất, Hoạt động giảng dạy, Dịch vụ hỗ trợ, v.v.).
- Tính năng nhân bản khảo sát (Duplicate Survey): Sao chép toàn bộ nội dung phiếu cũ (bao gồm câu hỏi, phương án, cấu hình đối tượng) sang một bản nháp mới chỉ với 1 click, giúp tiết kiệm thời gian khởi tạo phiếu khảo sát cho các học kỳ sau.
- Chia sẻ và phát hành qua mã QR: Tự động sinh mã QR liên kết trực tiếp tới URL làm bài. Cán bộ có thể trình chiếu trực tiếp trên máy chiếu lớp học hoặc tải ảnh PNG để in dán tại bảng tin các giảng đường A27, A28.
- Bảng điều khiển phân tích số liệu thời gian thực (Analytics Dashboard):
  + Tự động tính tỷ lệ hoàn thành, điểm trung bình toàn bài và điểm trung bình theo từng nhóm tiêu chí.
  + Vẽ biểu đồ cột ngang phân bố điểm Likert và biểu đồ tròn tỷ lệ phần trăm phương án trắc nghiệm.
  + Hỗ trợ bộ lọc dữ liệu thống kê theo Khóa hoặc theo Lớp học.
- Xuất báo cáo chuyên nghiệp:
  + File Excel (.xlsx): Gồm 2 sheets riêng biệt (Sheet 1: Bảng tổng hợp thống kê chỉ số; Sheet 2: Bảng dữ liệu phản hồi chi tiết của từng sinh viên).
  + File PDF (.pdf): Định dạng văn bản hành chính theo tiêu chuẩn Nhà trường, nhúng sẵn font Unicode Roboto hiển thị chuẩn tiếng Việt có dấu.

4.3. Phân hệ quản trị hệ thống (Admin & Audit Logs)
- Toàn quyền quản trị khảo sát của toàn bộ các đơn vị trong trường.
- Quản lý người dùng: Tạo tài khoản cán bộ/sinh viên, đặt lại mật khẩu, kích hoạt hoặc khóa tài khoản vi phạm.
- Nhật ký kiểm toán (Audit Logs): Ghi nhận toàn bộ thao tác trọng yếu (Đăng nhập, tạo khảo sát, sửa câu hỏi, xóa phiếu, nộp bài, v.v.) kèm thông tin định danh người thực hiện, địa chỉ IP và dấu mốc thời gian, phục vụ công tác đối soát và an toàn thông tin.

────────────────────────────────────────────────────────────

CHƯƠNG 5. CÁC MẪU THIẾT KẾ ÁP DỤNG

5.1. Kiến trúc phân tầng (Layered Architecture)
Toàn bộ Backend được phân tách thành 4 tầng: `Route` -> `Controller` -> `Service` -> `Data Access`. Lợi ích lớn nhất của mẫu kiến trúc này là phân định trách nhiệm rõ ràng (Separation of Concerns). Khi kiểm thử tự động, bộ test có thể gọi trực tiếp các phương thức của tầng Service mà không cần phải dựng môi trường HTTP server giả lập, giúp việc kiểm thử diễn ra nhanh chóng và chính xác.

5.2. Mẫu Singleton (Single Instance)
Các lớp dịch vụ nghiệp vụ (`AuthService`, `SurveyService`, `ResponseService`, `AnalyticsService`) đều được khởi tạo và xuất ra dưới dạng thể hiện duy nhất: `module.exports = new AuthService()`. Nhờ cơ chế module caching của Node.js, mọi file trong ứng dụng khi `require` đều nhận về cùng một tham chiếu duy nhất. Tương tự, kết nối cơ sở dữ liệu trong `db.js` cũng là một Singleton, đảm bảo toàn bộ tiến trình Express chỉ mở đúng một file kết nối SQLite, tránh xung đột khóa ghi file CSDL.

5.3. Mẫu Facade (Giao diện đơn giản hóa CSDL)
Module `server/src/config/db.js` đóng vai trò là một Facade che giấu các chi tiết phức tạp của thư viện `node:sqlite`. Thay vì phải viết câu lệnh `prepare()`, quản lý con trỏ truy vấn hoặc tự gõ thủ công `BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`, các Service chỉ cần tương tác qua 4 hàm giao diện thanh lịch:
- `db.query(sql, params)`: Truy vấn danh sách bản ghi.
- `db.get(sql, params)`: Lấy 1 bản ghi duy nhất.
- `db.run(sql, params)`: Thực thi INSERT/UPDATE/DELETE.
- `db.transaction(fn)`: Thực thi khối lệnh an toàn trong một transaction.
Nếu trong tương lai hệ thống chuyển sang PostgreSQL hoặc MySQL, nhóm chỉ cần viết lại tầng Facade này mà không phải sửa đổi logic trong các tầng Service.

5.4. Mẫu Chain of Responsibility (Chuỗi xử lý Middleware)
Kiến trúc middleware của Express thể hiện trọn vẹn tinh thần của Chain of Responsibility. Một yêu cầu gửi đến sẽ tuần tự đi qua các mắt xích:
- `cors()`: Kiểm tra nguồn gốc tên miền hợp lệ.
- `express.json()`: Giải mã payload dữ liệu.
- `authenticateToken`: Giải mã và xác thực tính hợp lệ của JWT.
- `authorizeRoles('STAFF', 'ADMIN')`: Kiểm tra vai trò quyền hạn.
- `Controller`: Xử lý nghiệp vụ.
- `errorHandler`: Mắt xích cuối cùng chuyên trách bắt lỗi tập trung và trả mã lỗi chuẩn hóa.
Nếu bất kỳ mắt xích nào phát hiện sai phạm (ví dụ token hết hạn), chuỗi sẽ lập tức ngắt quãng và trả về mã lỗi 401/403 mà không cho phép đi tiếp vào các tầng sâu hơn.

5.5. Mẫu Factory Function (Khởi tạo Middleware RBAC)
Hàm `authorizeRoles(...allowedRoles)` đóng vai trò là một Factory Function. Hàm này nhận vào danh sách các quyền được phép (ví dụ `'STAFF'`, `'ADMIN'`) và trả về (sản sinh ra) một hàm middleware Express hoàn chỉnh đã được cấu hình sẵn logic kiểm tra vai trò người dùng. Cách tiếp cận này giúp mã nguồn định tuyến cực kỳ gọn gàng và dễ đọc: `router.post('/create', authenticateToken, authorizeRoles('STAFF', 'ADMIN'), surveyController.create)`.

5.6. Mẫu Provider và Observer ở phía giao diện React
Ở phía Frontend, `AuthContext.Provider` và `ToastContext.Provider` hoạt động theo nguyên lý của mẫu Observer. Context đóng vai trò là Subject (nơi lưu trữ trạng thái phiên làm việc và hàng đợi thông báo), còn các Component giao diện (Navbar, các trang làm bài, các nút bấm) là các Observers đăng ký theo dõi thông qua các custom hook `useAuth()` và `useToast()`. Khi trạng thái người dùng thay đổi (đăng nhập thành công hoặc đăng xuất), mọi component liên quan lập tức được kích hoạt render lại đồng bộ mà không cần truyền props thủ công qua nhiều tầng (tránh hiện tượng Prop Drilling).

────────────────────────────────────────────────────────────

CHƯƠNG 6. RÀ SOÁT, TỐI ƯU VÀ KHẮC PHỤC LỖI

Trong giai đoạn hoàn thiện dự án và chuẩn bị triển khai lên môi trường Internet thực tế, nhóm đã tiến hành rà soát chuyên sâu toàn bộ mã nguồn dưới góc độ kiểm thử bảo mật (Pentest) và kiểm thử trải nghiệm người dùng (UX). Quá trình này đã phát hiện và khắc phục triệt để nhiều vấn đề nghiêm trọng:

6.1. Các lỗ hổng bảo mật và giải pháp xử lý
1. Lỗ hổng mật khẩu "vạn năng" 123456:
   - Hiện trạng cũ: Mã nguồn cũ có đoạn kiểm tra: nếu mật khẩu nhập sai nhưng trùng với `123456` hoặc `dlu123456`, hệ thống tự động ghi đè mật khẩu của tài khoản đó thành `123456` và cho đăng nhập luôn. Điều này dẫn đến nguy cơ bất kỳ ai biết email của Admin cũng có thể chiếm đoạt tài khoản quản trị cao nhất.
   - Giải pháp: Xóa bỏ hoàn toàn đoạn mã này. Mật khẩu không trùng khớp với mã băm trong CSDL sẽ bị từ chối 401 ngay lập tức. Mọi nỗ lực đăng nhập thất bại đều được ghi vào Audit Log.
2. Lỗ hổng giả mạo đăng nhập Google SSO chỉ bằng email trần:
   - Hiện trạng cũ: Endpoint `/api/auth/google-dlu` chỉ đọc chuỗi email từ request body mà không xác minh chữ ký từ Google. Kẻ tấn công có thể dùng Postman/cURL gửi `{"email":"admin@dlu.edu.vn"}` để nhận về token quản trị.
   - Giải pháp: Bắt buộc gửi kèm Google ID Token hợp lệ. Phía server gửi token tới dịch vụ `https://oauth2.googleapis.com/tokeninfo` để Google xác thực chữ ký số, đồng thời kiểm tra token có đúng cấp cho `GOOGLE_CLIENT_ID` của trường hay không và email đã được `email_verified` chưa. Ngoài ra, chặn hoàn toàn việc tự động cấp quyền Cán bộ qua SSO (chỉ email sinh viên mới được tự động khởi tạo).
3. Lỗ hổng tự tạo tài khoản với MSSV bất kỳ:
   - Hiện trạng cũ: Khi người dùng đăng nhập bằng một MSSV chưa có trong CSDL, hệ thống tự động lưu người dùng mới với mật khẩu vừa nhập.
   - Giải pháp: Bỏ cơ chế tự đăng ký tự do qua form đăng nhập thông thường. Sinh viên mới bắt buộc phải xác thực thông qua Google Workspace chính thức (@dlu.edu.vn) hoặc do Quản trị viên cấp.
4. Lỗ hổng lộ khóa bí mật JWT và CORS mở hoàn toàn:
   - Hiện trạng cũ: Chuỗi `JWT_SECRET` bị viết cứng trong mã nguồn và công khai trên GitHub; CORS được cấu hình mở cho tất cả mọi nguồn (`*`).
   - Giải pháp: Tách `JWT_SECRET` sang biến môi trường riêng. Ở môi trường production, server sẽ từ chối khởi động nếu thiếu `JWT_SECRET` hoặc chuỗi ngắn hơn 32 ký tự. Cấu hình CORS được thắt chặt và quản lý thông minh.
5. Lỗ hổng tài khoản bị khóa nhưng token cũ vẫn thao tác được:
   - Hiện trạng cũ: Do JWT có thời hạn 7 ngày và middleware chỉ kiểm tra chữ ký token, nên khi Admin khóa tài khoản sinh viên vi phạm, sinh viên đó vẫn tiếp tục gửi bài khảo sát bình thường.
   - Giải pháp: Bổ sung bước kiểm tra trạng thái trong `authMiddleware.js`: mỗi request đều truy vấn nhanh CSDL để kiểm tra người dùng có còn `is_active = 1` hay không.
6. Nguy cơ giả mạo IP qua Header:
   - Giải pháp: Chuyển từ việc đọc thủ công `X-Forwarded-For` sang sử dụng `req.ip` chuẩn của Express kết hợp cấu hình `app.set('trust proxy', 1)` an toàn khi chạy sau reverse proxy của Nginx hoặc Render.

Bảng 6.1. Tổng hợp các lỗ hổng bảo mật đã khắc phục
| STT | Lỗ hổng bảo mật | Mức độ nguy cơ | Biện pháp khắc phục triệt để |
| :---: | :--- | :---: | :--- |
| 1 | Cửa hậu mật khẩu 123456 ghi đè tài khoản Admin | Rất nghiêm trọng | Xóa bỏ cửa hậu, ghi nhật ký đăng nhập thất bại vào Audit Log |
| 2 | Giả mạo đăng nhập Google SSO chỉ bằng email trần | Rất nghiêm trọng | Bắt buộc kiểm tra chữ ký ID Token qua Google API, kiểm tra Audience Client ID |
| 3 | Tự đăng ký tài khoản tự do với MSSV bất kỳ | Cao | Khóa tính năng tự tạo tài khoản qua mật khẩu, chỉ cho phép qua Google SSO DLU |
| 4 | JWT Secret viết cứng, CORS mở không giới hạn | Cao | Bắt buộc cấu hình JWT_SECRET ≥ 32 ký tự ở production, thắt chặt danh sách trắng CORS |
| 5 | Tài khoản bị khóa vẫn gửi được dữ liệu | Trung bình | Kiểm tra trạng thái kích hoạt `is_active` tức thời tại mỗi request API |
| 6 | Giả mạo IP thông qua HTTP Header | Thấp | Sử dụng `req.ip` của Express kết hợp cấu hình `trust proxy` |

6.2. Các lỗi logic nghiệp vụ và tối ưu trải nghiệm người dùng
Bên cạnh bảo mật, trong quá trình thử nghiệm thực tế trên hệ thống web, nhóm đã phát hiện và xử lý các lỗi logic và giao diện quan trọng:
1. Lỗi kiểm tra tính hợp lệ của câu trả lời (`validateAnswers`):
   - Ngăn chặn kẻ xấu nộp ID câu hỏi của phiếu khác, ID phương án của câu khác, điểm Likert vượt ngoài thang 1-5, hoặc nộp lặp lại 2 câu trả lời cho cùng 1 câu hỏi.
2. Lỗi sinh viên không thấy khảo sát mới tạo (Survey Target Filter):
   - Hiện trạng phát sinh: Cán bộ tạo khảo sát mới và phát hành cho đối tượng toàn trường (`ALL`), nhưng sinh viên đăng nhập vào chỉ nhìn thấy đúng 1 bài khảo sát mẫu cũ.
   - Nguyên nhân: Hàm lọc `isStudentEligible` trước đó so khớp chuỗi phân biệt chữ hoa/thường (`cntt` khác `CNTT`) và xử lý thiếu sót giá trị mặc định của trường `target_type = 'ALL'`.
   - Khắc phục: Viết lại hàm `isStudentEligible` trong `responseService.js`: chuẩn hóa tất cả mã khoa, lớp, khóa về chữ hoa, đồng thời quy định rõ: nếu khảo sát không có target hoặc target là `ALL` thì toàn bộ sinh viên đều được tham gia.
3. Lỗi mất phiên đăng nhập khi bấm vào Logo / Trang chủ (Session Persistence):
   - Hiện trạng phát sinh: Sinh viên đang đăng nhập, khi bấm vào logo DLU hoặc nút "Trang chủ" trên Navbar thì bị đăng xuất đột ngột và đẩy về trang `/login`.
   - Nguyên nhân: Route mặc định `/` trong `App.jsx` sử dụng component `HomeRedirect`. Khi người dùng truy cập trang chủ, trong tích tắc React khởi động state `user` tạm thời là `null` trước khi đọc xong `localStorage`, khiến `HomeRedirect` vội vã chuyển hướng sang `/login` trước khi cờ `loading` kịp kết thúc.
   - Khắc phục: Đồng bộ hóa cờ `loading` trong `AuthContext` và `HomeRedirect`. Chỉ khi xác nhận chắc chắn `loading === false` và không có thông tin xác thực thì mới chuyển về `/login`; nếu đã đăng nhập thì chuyển hướng chính xác theo vai trò (`/student/surveys` hoặc `/staff/surveys`).
4. Lỗi nút đăng nhập trên thanh điều hướng (Navbar Button):
   - Hiện trạng phát sinh: Nút đăng nhập trên Navbar ở một số độ phân giải màn hình hoặc khi bị menu dropdown che lấp không phản hồi thao tác click.
   - Khắc phục: Tái cấu trúc component `Navbar.jsx`, phân định rõ ràng giữa trạng thái chưa đăng nhập (hiển thị nút đăng nhập nhận diện DLU có hiệu ứng hover mượt mà) và trạng thái đã đăng nhập (hiển thị thông tin người dùng, vai trò và menu tài khoản).
5. Xóa bỏ tài khoản mẫu điền sẵn ở form đăng nhập:
   - Khắc phục: Xóa bỏ hoàn toàn việc tự động điền sẵn tài khoản/mật khẩu demo ở các ô input, đảm bảo tính bảo mật và trải nghiệm thực tế; đồng thời bố trí bảng thông tin tài khoản mẫu thử nghiệm ở khung riêng biệt kèm nút click-to-fill tiện dụng.
6. Lỗi nút "Lưu thay đổi" trong Modal cập nhật thông tin bị trùng màu:
   - Hiện trạng phát sinh: Trong modal cập nhật hồ sơ cá nhân sinh viên, nút bấm "Lưu thay đổi" có màu chữ trắng trên nền sáng, khiến người dùng không nhìn thấy nút để xác nhận.
   - Khắc phục: Chỉnh sửa lại style nút bấm với màu xanh thương hiệu DLU (`bg-dlu-primary text-white hover:bg-dlu-hover`), bổ sung trạng thái disable khi đang xử lý và độ tương phản đạt chuẩn WCAG.

6.3. Tối ưu triển khai Cloud (Vercel & Render, CORS, Cold Start)
Khi đưa website lên môi trường Internet thực tế (Frontend deploy trên Vercel tại địa chỉ `https://webkhaosatdlu.vercel.app`, Backend API deploy trên Render), hệ thống phát sinh lỗi: `"Không thể kết nối đến Backend Server (Network Error)"`. Nhóm đã phân tích sâu và giải quyết triệt để 3 nguyên nhân cốt lõi:
1. Cơ chế mở khóa CORS động cho Vercel & Render:
   - Khi Backend Render chỉ cho phép `CLIENT_URL = http://localhost:5173`, mọi request từ domain Vercel gửi sang đều bị trình duyệt chặn preflight `OPTIONS`.
   - Nhóm đã nâng cấp hàm `isOriginAllowed` trong `server.js`: tự động cho phép mọi domain `*.vercel.app` (cả domain chính thức lẫn các URL preview theo branch Git), các domain `*.onrender.com`, `localhost` và các domain trong biến `CLIENT_URL`. Đồng thời cấu hình `app.options('*', cors())` phản hồi HTTP 204 và cache kết quả preflight trong 24 giờ.
2. Xử lý hiện tượng "Cold Start" của Render (Free Tier):
   - Máy chủ miễn phí của Render sẽ chuyển sang trạng thái ngủ (spin down) sau 15 phút không có lượt truy cập, và cần khoảng 30 - 50 giây để khởi động lại ở lần gọi đầu tiên.
   - Khắc phục:
     + Trong `api.js`: Nâng timeout của Axios lên `60000ms` (60 giây) để tránh tình trạng trình duyệt tự ngắt kết nối quá sớm khi backend đang thức dậy.
     + Trong `GoogleCallbackPage.jsx`: Bổ sung nút **"🔄 Thử kết nối lại"**. Nếu lần kết nối đầu tiên bị gián đoạn do server đang khởi động, sinh viên chỉ cần bấm thử lại sau 20-30 giây là sẽ hoàn tất đăng nhập ngay lập tức mà không phải thực hiện lại từ đầu.
3. Giải mã JWT an toàn tương thích mọi trình duyệt:
   - Bổ sung hàm `parseJwtPayload` ở client xử lý chuẩn hóa ký tự Base64URL và bảng mã UTF-8 bằng `TextDecoder`, khắc phục triệt để lỗi hiển thị tiếng Việt có dấu trong tên của sinh viên khi đăng nhập từ trình duyệt Safari (iOS/macOS) và Google Chrome.
4. Bắt lỗi rewrite HTML của Vercel:
   - Bổ sung interceptor trong `api.js`: nếu Vercel rewrite nhầm route `/api` về trang `index.html` (do thiếu cấu hình `VITE_API_URL`), hệ thống sẽ phát hiện ngay chuỗi `<!doctype html` và hiển thị thông báo hướng dẫn quản trị viên cấu hình đúng biến môi trường thay vì báo lỗi crash ứng dụng.

────────────────────────────────────────────────────────────

CHƯƠNG 7. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG

7.1. Kiểm thử tự động (Automated Testing Suite)
Dự án được trang bị bộ kiểm thử tự động toàn diện đặt tại file `server/test/api.test.js`, chạy trực tiếp bằng lệnh `npm test`. Bộ kiểm thử thực hiện nạp lại dữ liệu mẫu sạch và tuần tự kiểm thử 6 Module nghiệp vụ với 100% tỷ lệ vượt qua (Pass):

1. Module 1 - Xác thực & Phân quyền chuẩn DLU:
   - Đăng nhập thành công với tài khoản Admin, Cán bộ, Sinh viên.
   - Chặn đăng nhập Admin / Cán bộ bằng mật khẩu mặc định 123456 (kết quả mong đợi: 401).
   - Không tự cấp tài khoản khi nhập MSSV chưa tồn tại trong hệ thống (kết quả mong đợi: 401).
   - Chặn giả mạo Google SSO bằng cách chỉ gửi email trần không có token (kết quả mong đợi: 401).
   - Đăng nhập Google Workspace DLU (@dlu.edu.vn) với token hợp lệ thành công.
   - Chặn email ngoài tên miền trường (@gmail.com) chính xác (kết quả mong đợi: 400).
   - Không tự cấp quyền Cán bộ cho email không phải sinh viên (kết quả mong đợi: 403).
   - Chế độ demo Google chỉ cho phép đăng nhập tài khoản sinh viên.
2. Module 2 - Quản lý Phiếu khảo sát & Câu hỏi:
   - Tạo khảo sát mới, thêm câu hỏi Likert và Trắc nghiệm thành công.
   - Chuyển trạng thái phát hành (PUBLISHED) và nhân bản khảo sát (Duplicate) thành công.
3. Module 3 - Thu thập phản hồi & Chống nộp trùng:
   - Sinh viên truy cập thấy đầy đủ các khảo sát hợp lệ được phát hành.
   - Sinh viên nộp câu trả lời thành công; nộp lại lần 2 bị chặn hoàn toàn (bảo đảm mỗi sinh viên chỉ làm 1 lần).
   - Chặn Cán bộ và Admin tham gia nộp phiếu khảo sát (chỉ dành riêng cho sinh viên).
   - Từ chối câu hỏi / phương án của phiếu khác, điểm Likert sai biên độ, câu trả lời trùng.
   - Chặn sinh viên xem và nộp khảo sát không thuộc lớp/khoa của mình.
   - Khảo sát ẩn danh hoàn toàn không lưu địa chỉ IP của người tham gia.
4. Module 4 - Thống kê & Trực quan hóa dữ liệu:
   - Tính toán chính xác tổng lượt nộp, điểm trung bình toàn bài, điểm trung bình từng tiêu chí và phân bổ phương án trắc nghiệm.
5. Module 5 - Xuất báo cáo Excel & PDF:
   - Xuất file Excel (.xlsx) gồm 2 sheet định dạng chuẩn thành công.
   - Xuất file PDF văn bản hành chính nhúng font tiếng Việt Unicode thành công.
6. Module 6 - Quản trị Hệ thống & Nhật ký Audit:
   - Quản lý người dùng, khóa/mở khóa tài khoản và lưu vết đầy đủ các sự kiện trong Audit Logs.

Kết quả thực thi: `🎉 TẤT CẢ 6 MODULE BACKEND ĐÃ ĐẠT 100% KIỂM THỬ THÀNH CÔNG!`

7.2. Kiểm thử thủ công và kiểm thử tích hợp HTTP/CORS
Bên cạnh kiểm thử tầng Service, nhóm tiến hành kiểm thử tích hợp qua giao thức HTTP thực tế bằng cURL và trên trình duyệt web tại môi trường Cloud:

Bảng 7.1. Kết quả kiểm thử thủ công và tích hợp HTTP
| Kịch bản kiểm thử | Dữ liệu đầu vào / Thao tác | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :--- | :--- | :--- | :--- | :---: |
| Đăng nhập mật khẩu sai / cửa hậu | `admin@dlu.edu.vn` + `123456` | Bị từ chối HTTP 401 | HTTP 401 Unauthorized | Đạt |
| Giả mạo Google SSO không token | Body: `{"email":"admin@dlu.edu.vn"}` | Bị từ chối HTTP 401 | HTTP 401 Unauthorized | Đạt |
| Gọi API từ domain lạ (CORS) | Header `Origin: https://evil.com` | Không cấp header `Access-Control-Allow-Origin` | Header Allow Origin: null | Đạt |
| Gọi API từ domain Vercel | Header `Origin: https://webkhaosatdlu.vercel.app` | Cấp phép CORS, phản hồi OPTIONS 204 | Header Allow Origin: Vercel, Status 204 | Đạt |
| Gọi API từ Localhost | Header `Origin: http://localhost:5173` | Cấp phép CORS bình thường | Header Allow Origin: localhost | Đạt |
| Admin khóa tài khoản đang đăng nhập | Đổi `is_active = 0` trong CSDL | Request tiếp theo bị chặn | HTTP 403 Tài khoản bị khóa | Đạt |
| Sinh viên làm bài và nộp bài | Trả lời đầy đủ câu hỏi bắt buộc | Ghi nhận câu trả lời, hiện trang cảm ơn | Thành công, lưu CSDL | Đạt |
| Nộp lại bài lần thứ 2 | Vào lại link bài đã làm | Khóa nút nộp, báo đã hoàn thành | Bị chặn, không cho nộp lại | Đạt |
| Phục hồi khi Render Cold Start | Bấm đăng nhập khi Render đang ngủ | Nút "Thử kết nối lại" hoạt động mượt mà | Đăng nhập thành công sau khi server thức dậy | Đạt |

────────────────────────────────────────────────────────────

CHƯƠNG 8. HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN

Dù đã hoàn thiện toàn diện các chức năng nghiệp vụ và khắc phục triệt để các lỗi kỹ thuật quan trọng, hệ thống vẫn có một số hướng phát triển có thể nâng cấp trong tương lai:
1. Tự động hóa đồng bộ dữ liệu đào tạo: Hiện tại khi đăng nhập Google DLU lần đầu, sinh viên được tự cập nhật Họ tên, Lớp và Khóa học. Hướng phát triển tiếp theo là kết nối API trực tiếp với Cổng thông tin đào tạo của Trường Đại học Đà Lạt để tự động khóa cố định thông tin lớp học ngay khi đăng nhập, tránh việc sinh viên tự ý đổi lớp để làm khảo sát chéo.
2. Cơ chế giới hạn tần suất gửi yêu cầu (Rate Limiting): Bổ sung middleware `express-rate-limit` để giới hạn số lần thử mật khẩu sai liên tiếp từ một địa chỉ IP nhằm phòng ngừa tấn công dò quét Brute-force.
3. Nâng cấp lưu trữ Token sang Cookie HttpOnly: Hiện tại token được lưu tại `localStorage` để thuận tiện cho SPA. Việc chuyển sang lưu trữ trong Cookie với cờ `HttpOnly`, `Secure` và `SameSite=Strict` sẽ nâng cao khả năng miễn nhiễm với các cuộc tấn công XSS.
4. Mở rộng cơ sở dữ liệu khi triển khai toàn trường: SQLite với chế độ ghi nhật ký WAL đáp ứng hoàn hảo cho quy mô một Khoa (hàng ngàn sinh viên). Khi mở rộng phục vụ đồng thời cho toàn bộ hơn 15.000 sinh viên Đại học Đà Lạt trong tuần cao điểm khảo sát, hệ thống có thể chuyển đổi mượt mà sang PostgreSQL thông qua việc cấu hình lại tầng Facade `db.js` mà không phải thay đổi mã nguồn nghiệp vụ.

────────────────────────────────────────────────────────────

CHƯƠNG 9. KẾT LUẬN

Qua quá trình nghiên cứu và thực hiện đề tài Báo cáo Chuyên ngành "Xây dựng website khảo sát mức độ hài lòng của sinh viên Trường Đại học Đà Lạt", nhóm chúng em đã đạt được các kết quả nổi bật:
1. Xây dựng hoàn chỉnh một ứng dụng Web chuyên nghiệp, bám sát các yêu cầu thực tế của công tác đảm bảo chất lượng giáo dục tại Trường Đại học Đà Lạt: phân quyền chặt chẽ 3 vai trò, hỗ trợ 4 dạng câu hỏi khảo sát, chống nộp trùng lặp, chia sẻ linh hoạt qua mã QR, phân tích trực quan hóa biểu đồ và xuất báo cáo 2 định dạng Excel, PDF.
2. Vận dụng hiệu quả và nhuần nhuyễn các mẫu thiết kế phần mềm kinh điển: Kiến trúc phân tầng (Layered Architecture), Singleton, Facade, Chain of Responsibility, Factory Function và Observer/Provider, giúp mã nguồn có tính module hóa cao, trong sáng, dễ mở rộng và thuận lợi cho việc kiểm thử tự động.
3. Rèn luyện tư duy phản biện và an toàn thông tin: Không chỉ dừng lại ở việc hoàn thành các tính năng bề nổi, nhóm đã đi sâu vào việc rà soát mã nguồn, phát hiện và vá triệt để các lỗ hổng bảo mật nghiêm trọng (cửa hậu mật khẩu, giả mạo Google SSO, rò rỉ khóa JWT), giải quyết dứt điểm các lỗi logic hiển thị khảo sát và tối ưu hóa hệ thống khi triển khai thực tế trên môi trường Cloud (Vercel & Render).

Đề tài đã mang lại cho nhóm những trải nghiệm thực chiến vô cùng quý báu về quy trình phát triển phần mềm chuẩn mực: từ phân tích yêu cầu, thiết kế kiến trúc, tổ chức CSDL, lập trình full-stack, viết bộ kiểm thử tự động đến triển khai và vận hành hệ thống thực tế trên Internet.

────────────────────────────────────────────────────────────

TÀI LIỆU THAM KHẢO

[1] E. Gamma, R. Helm, R. Johnson, J. Vlissides, Design Patterns: Elements of Reusable Object-Oriented Software, Addison-Wesley, 1994.
[2] OWASP Foundation, OWASP Top 10 – 2021: The Ten Most Critical Web Application Security Risks, https://owasp.org/Top10/
[3] Google for Developers, Authenticate with a backend server using Google Identity Services, https://developers.google.com/identity/sign-in/web/backend-auth
[4] Express.js Documentation, Production best practices: Performance and Reliability & Express behind proxies, https://expressjs.com/en/guide/behind-proxies.html
[5] Node.js Technical Documentation, SQLite module (node:sqlite) & Built-in Crypto, https://nodejs.org/api/sqlite.html
[6] React Documentation, Managing State with Context and Hooks, https://react.dev/learn/passing-data-deeply-with-context
[7] Trường Đại học Đà Lạt, Cổng thông tin Đảm bảo Chất lượng Giáo dục DLU, https://dlu.edu.vn
