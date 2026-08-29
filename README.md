# Website Khảo Sát Mức Độ Hài Lòng Của Sinh Viên — Trường Đại Học Đà Lạt (DLU)

> **Đồ án chuyên ngành** — Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt  
> **Chủ đề:** Xây dựng hệ thống khảo sát trực tuyến, thu thập phản hồi của sinh viên, thống kê trực quan hóa bằng biểu đồ, xuất báo cáo PDF/Excel và phân quyền 3 vai trò.  
> **Khẩu hiệu DLU:** *"Thụ nhân – Khai phóng – Bản sắc"*

---

## 📌 1. Tech Stack & Kiến trúc Hệ thống

- **Frontend:** ReactJS (Vite) + Tailwind CSS + Lucide Icons
- **Backend:** Node.js + Express (RESTful API theo mô hình `Route - Controller - Service - Data Access`)
- **Cơ sở dữ liệu:** SQLite / PostgreSQL / MySQL (Cấu trúc chuẩn hóa quan hệ 3NF theo ERD)
- **Trực quan hóa biểu đồ:** Chart.js & React-Chartjs-2 (Biểu đồ thang đo Likert, Biểu đồ tròn/Doughnut trắc nghiệm, Biểu đồ tiến độ)
- **Sinh mã QR & Chia sẻ:** `qrcode.react` & `qrcode` (Tạo link truy cập trực tiếp và tải ảnh mã QR .PNG)
- **Xuất báo cáo:** `ExcelJS` (File Excel 2 sheets: Bảng tổng quan thống kê + Dữ liệu phản hồi chi tiết) & `PDFKit` (Báo cáo PDF chuẩn văn bản hành chính)
- **Xác thực & Bảo mật:** JSON Web Token (JWT) + Hash mật khẩu `bcryptjs` + Chống nộp bài trùng lặp bằng Unique Constraint & Database Transaction.

---

## 👥 2. Tài khoản Mẫu để Demo / Bảo vệ Đồ án

| Vai trò | Email / Tài khoản | Mật khẩu | Thông tin chi tiết |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin@dlu.edu.vn` (hoặc `admin`) | `admin123` | Toàn quyền quản lý người dùng, phân quyền, xem nhật ký Audit Logs, quản lý mọi khảo sát |
| **Cán bộ khảo sát (STAFF)** | `canbo.cntt@dlu.edu.vn` (hoặc `canbo.cntt`) | `canbo123` | ThS. Nguyễn Văn Hải - Trợ lý Đào tạo Khoa CNTT. Tạo, sửa câu hỏi, phát hành, lấy mã QR, xem thống kê biểu đồ và xuất báo cáo |
| **Cán bộ ĐBCL (STAFF)** | `canbo.dbcl@dlu.edu.vn` | `canbo123` | Trần Thị Thu Hà - Phòng Đảm bảo Chất lượng |
| **Sinh viên (STUDENT)** | `2111234@dlu.edu.vn` (hoặc `2111234`) | `123456` | Sinh viên Trần Văn An - Lớp CTK45 (Khoa CNTT) |
| **Sinh viên (STUDENT)** | `2211236@dlu.edu.vn` (hoặc `2211236`) | `123456` | Sinh viên Phạm Minh Cường - Lớp CTK46 (Khoa CNTT) |
| **Sinh viên (STUDENT)** | `2311238@dlu.edu.vn` (hoặc `2311238`) | `123456` | Sinh viên Đặng Quốc Hùng - Lớp CTK47 (Khoa CNTT) |

> 💡 *Trên giao diện trang Đăng nhập, có sẵn 3 nút "Đăng nhập nhanh" 1-click cho Sinh viên, Cán bộ và Admin để tiện cho việc trình bày trước hội đồng.*

---

## 🚀 3. Hướng dẫn Cài đặt & Khởi chạy Nhanh

### Bước 1: Khởi tạo CSDL và Dữ liệu Mẫu (Seed Data)
```bash
npm run seed
```
Lệnh này sẽ tự động tạo cấu trúc bảng CSDL và nạp 4 Khoa, 9 người dùng mẫu, 3 khảo sát mẫu (đang mở và bản nháp) cùng các câu trả lời mẫu.

### Bước 2: Chạy Backend Server
Mở một cửa sổ Terminal:
```bash
npm run server
```
Server API sẽ khởi động tại: `http://localhost:5001`

### Bước 3: Chạy Frontend Client
Mở một cửa sổ Terminal khác:
```bash
npm run client
```
Giao diện ứng dụng sẽ khởi động tại: `http://localhost:5173`

### Bước 4: Chạy Bộ Kiểm thử Tự động (Automated Test Suite)
```bash
npm run test
```

---

## 📂 4. Cấu trúc Thư mục Dự án

```
webkhaosatdlu/
├── package.json               # Root scripts điều khiển cả client và server
├── server/                    # Source code Backend API (Node.js Express)
│   ├── src/
│   │   ├── config/            # Kết nối CSDL SQLite / Postgres / MySQL
│   │   ├── controllers/       # Xử lý HTTP Request / Response
│   │   ├── services/          # Xử lý Logic nghiệp vụ (Business Logic)
│   │   ├── models/            # Schema và câu truy vấn CSDL
│   │   ├── middlewares/       # Xác thực JWT, Phân quyền RBAC, Bắt lỗi tập trung
│   │   ├── routes/            # Khai báo các API Endpoints
│   │   ├── seeders/           # Dữ liệu khởi tạo mẫu chuẩn tiếng Việt DLU
│   │   └── utils/             # Trình xuất Excel (.xlsx), PDF, Audit Logger
│   ├── test/                  # Bộ test tự động kiểm thử toàn diện
│   └── server.js              # Điểm khởi động Server
└── client/                    # Source code Frontend (ReactJS + Tailwind CSS)
    ├── src/
    │   ├── components/        # Reusable UI (Navbar, Footer, Modal, Badge, QRModal, Charts)
    │   ├── contexts/          # AuthContext (quản lý phiên đăng nhập), ToastContext (thông báo)
    │   ├── pages/             # 8 Trang giao diện đầy đủ theo yêu cầu:
    │   │   ├── auth/          # LoginPage (Đăng nhập theo nhận diện DLU)
    │   │   ├── student/       # StudentSurveysPage, TakeSurveyPage, SurveySuccessPage
    │   │   ├── staff/         # SurveyListPage, SurveyEditorPage, QuestionBuilderPage
    │   │   ├── analytics/     # SurveyAnalyticsPage (Biểu đồ), SurveyHistoryPage (Lịch sử)
    │   │   └── admin/         # UserManagementPage, AuditLogPage
    │   ├── services/          # api.js (Axios cấu hình auto JWT interceptors)
    │   └── App.jsx            # Định tuyến điều hướng & phân quyền trang
```

---

## 🎓 5. Điểm Trọng Tâm để Bảo Vệ Trước Hội Đồng

1. **Module 1 - Xác thực & Phân quyền:**
   - Sử dụng chuẩn công nghiệp JWT (JSON Web Token) kết hợp băm mật khẩu `bcrypt` 10 rounds.
   - Middleware `authorizeRoles('ADMIN', 'STAFF', 'STUDENT')` ngăn chặn triệt để hành vi sinh viên cố tình truy cập trái phép vào API tạo/sửa khảo sát.

2. **Module 2 - Thiết kế Câu hỏi Đa dạng:**
   - Hỗ trợ 4 loại câu hỏi phổ biến trong nghiên cứu khoa học và khảo sát giáo dục: Thang đo Likert 1–5 mức độ, Trắc nghiệm đơn, Trắc nghiệm nhiều lựa chọn và Câu hỏi tự luận.
   - Hỗ trợ phân loại nhóm tiêu chí (Cơ sở vật chất, Giảng dạy, Dịch vụ hỗ trợ) để phục vụ tính điểm theo tiêu chuẩn kiểm định giáo dục.

3. **Module 3 - Thu thập & Chống Trả lời Trùng:**
   - Cơ chế Transaction trong CSDL đảm bảo ghi nhận đồng thời `survey_responses` và chi tiết các câu trả lời `answers`.
   - Ràng buộc `UNIQUE(survey_id, student_id)` và kiểm tra logic ở tầng Service đảm bảo mỗi sinh viên chỉ được gửi phản hồi 1 lần duy nhất trên mỗi đợt khảo sát.
   - Giao diện thân thiện, tối ưu 100% trên thiết bị di động (Mobile Responsive), hỗ trợ sinh mã QR nhanh để sinh viên quét mã làm khảo sát tại giảng đường hoặc trên mạng xã hội.

4. **Module 4 - Thống kê & Trực quan hóa:**
   - Tự động tính toán điểm trung bình có trọng số cho thang đo Likert, tính tỷ lệ phần trăm phân bố cho câu hỏi trắc nghiệm.
   - Tích hợp biểu đồ trực quan (Thanh ngang cho Likert, Doughnut tròn cho trắc nghiệm) và bộ lọc kết quả tức thì theo Lớp / Khóa.

5. **Module 5 - Xuất Báo cáo & Lịch sử:**
   - Xuất file **Excel (.xlsx)** gồm 2 sheet rõ ràng: Sheet tổng hợp thống kê điểm số và Sheet dữ liệu thô chi tiết từng câu trả lời.
   - Xuất file **PDF** định dạng báo cáo văn bản hành chính của Trường Đại học Đà Lạt.
   - Trang Lịch sử hỗ trợ tra cứu các đợt khảo sát đã kết thúc qua các năm học.

6. **Module 6 - Quản trị Hệ thống:**
   - Quản lý người dùng, cấp tài khoản, đổi mật khẩu, bật/khóa tài khoản.
   - Nhật ký hoạt động (`audit_logs`) ghi lại vết thao tác (ai đã làm gì, vào thời điểm nào) phục vụ việc giám sát và bảo mật hệ thống.

---

## 🌐 6. Hướng dẫn Triển khai (Deploy) lên Môi trường Thực tế

### Cách 1: Triển khai Full-stack trên VPS Ubuntu (Khuyên dùng cho Trường/Khoa)
1. **Cài đặt môi trường trên VPS:**
   ```bash
   sudo apt update && sudo apt install -y nodejs npm nginx
   sudo npm install -g pm2
   ```
2. **Clone mã nguồn và cài đặt dependencies:**
   ```bash
   git clone <URL_REPO> webkhaosatdlu
   cd webkhaosatdlu
   npm --prefix server install
   npm --prefix client install
   npm run seed
   ```
3. **Build Frontend:**
   ```bash
   npm run build
   ```
4. **Chạy Backend bằng PM2:**
   ```bash
   cd server
   pm2 start src/server.js --name "dlu-survey-api"
   pm2 startup && pm2 save
   ```
5. **Cấu hình Nginx làm Reverse Proxy:**
   - Trỏ `root` đến thư mục `webkhaosatdlu/client/dist` cho Frontend React.
   - Cấu hình `location /api/` proxy pass đến `http://localhost:5001`.

### Cách 2: Triển khai Miễn phí trên Cloud (Render / Vercel)
- **Backend API:** Deploy lên [Render.com](https://render.com) (Web Service Node.js, đặt biến môi trường `PORT=5001`, `JWT_SECRET=...`).
- **Frontend UI:** Deploy lên [Vercel.com](https://vercel.com) (Root directory: `client`, Build command: `npm run build`, Output: `dist`).
