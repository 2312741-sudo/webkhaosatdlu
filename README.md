# 🎓 Hệ Thống Khảo Sát Mức Độ Hài Lòng Của Sinh Viên — Trường Đại Học Đà Lạt (DLU)

[![Live Demo](https://img.shields.io/badge/Demo%20Website-webkhaosatdlu.vercel.app-006241?style=for-the-badge&logo=vercel)](https://webkhaosatdlu.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-2312741--sudo%2Fwebkhaosatdlu-181717?style=for-the-badge&logo=github)](https://github.com/2312741-sudo/webkhaosatdlu)
[![Build & Tests](https://img.shields.io/badge/Tests-100%25%20Passing%20(6%2F6%20Modules)-success?style=for-the-badge&logo=checkmarx)](https://github.com/2312741-sudo/webkhaosatdlu)

> **Báo cáo Chuyên ngành — Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt**  
> **Chủ đề:** Xây dựng website khảo sát trực tuyến mức độ hài lòng của sinh viên DLU, phân quyền 3 vai trò, tích hợp Google Workspace SSO, thống kê biểu đồ thời gian thực và xuất báo cáo Excel/PDF chuẩn hành chính.  
> **Khẩu hiệu DLU:** *"Thụ nhân – Khai phóng – Bản sắc"*  
> 📄 **Xem toàn văn Báo cáo chuyên ngành:** [BAO_CAO.md](BAO_CAO.md)  
> 📖 **Xem tài liệu kỹ thuật & Kiến trúc hệ thống:** [WIKI.md](WIKI.md)

---

## 👥 Nhóm Sinh Viên Thực Hiện

| STT | Họ và Tên | Mã số Sinh viên | Vai trò | Email liên hệ |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Nguyễn Thanh Tâm** | **2312741** | **Trưởng nhóm** (Full-stack, Kiến trúc CSDL, Bảo mật & CI/CD) | `2312741@dlu.edu.vn` |
| **2** | **Võ Công Vinh** | **2312800** | Thành viên (Giao diện Frontend, Trực quan hóa Biểu đồ & Mã QR) | `2312800@dlu.edu.vn` |
| **3** | **Nguyễn Đức Tín** | **2312774** | Thành viên (Nghiệp vụ Khảo sát, Xuất Báo cáo Excel/PDF & Kiểm thử) | `2312774@dlu.edu.vn` |

- **Giảng viên hướng dẫn:** **ThS. Trần Thị Phương Linh** — Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt.

---

## 🌐 Đường Dẫn Triển Khai Thực Tế (Live Deployment)

- 🔗 **Giao diện Ứng dụng Web (Frontend):** [https://webkhaosatdlu.vercel.app](https://webkhaosatdlu.vercel.app) *(Deploy trên nền tảng Vercel Cloud)*
- 🔗 **Máy chủ Dữ liệu (Backend API):** `https://webkhaosatdlu.onrender.com` *(Deploy trên nền tảng Render Cloud)*
- 🧪 **Kho lưu trữ Mã nguồn:** [https://github.com/2312741-sudo/webkhaosatdlu](https://github.com/2312741-sudo/webkhaosatdlu)

---

## 🚀 Tính Năng Nổi Bật Của Hệ Thống

1. **Xác thực Đa kênh & Google Workspace DLU:**
   - Hỗ trợ đăng nhập bằng tài khoản nội bộ (MSSV/Email) hoặc **Đăng nhập 1-chạm qua Google DLU (@dlu.edu.vn)**.
   - Tự động nhận diện niên khóa (K45, K46, K47, K48) và lớp học từ cấu trúc email sinh viên mà không cần đăng ký thủ công.
   - Có cơ chế phục hồi kết nối tự động khi máy chủ Render khởi động từ trạng thái ngủ (Cold Start).
2. **Phân quyền chặt chẽ (RBAC) 3 cấp độ:**
   - **Sinh viên (STUDENT):** Xem danh sách khảo sát áp dụng cho khoa/lớp mình, làm bài khảo sát, quét mã QR, cập nhật hồ sơ cá nhân.
   - **Cán bộ khảo sát (STAFF):** Quản lý vòng đời khảo sát (Bản nháp, Phát hành, Đóng), tạo bộ câu hỏi linh hoạt, nhân bản khảo sát, chia sẻ mã QR, xem thống kê trực quan và xuất báo cáo.
   - **Quản trị viên (ADMIN):** Quản lý toàn bộ người dùng, cấp quyền, đặt lại mật khẩu, khóa tài khoản vi phạm và theo dõi nhật ký kiểm toán (Audit Logs).
3. **Bộ câu hỏi chuẩn kiểm định giáo dục:**
   - Hỗ trợ 4 loại câu hỏi: Thang đo Likert 5 mức độ (từ 1 đến 5 sao), Trắc nghiệm đơn (Single choice), Trắc nghiệm nhiều lựa chọn (Multiple choice) và Ý kiến tự luận (Text feedback).
4. **Bảo đảm toàn vẹn dữ liệu & Chống nộp trùng:**
   - Ràng buộc `UNIQUE(survey_id, student_id)` và Database Transaction: mỗi sinh viên chỉ được nộp duy nhất 1 lần cho mỗi đợt khảo sát.
   - Chế độ khảo sát ẩn danh bảo vệ thông tin sinh viên, không ghi nhận IP và mã người dùng.
5. **Trực quan hóa số liệu & Xuất báo cáo hành chính:**
   - Biểu đồ thời gian thực (Chart.js): Phân bố thang đo Likert, biểu đồ tròn phương án trắc nghiệm, tính điểm trung bình toàn bài và theo tiêu chí.
   - Xuất file **Excel (.xlsx)** 2 sheet (Bảng tổng hợp thống kê + Bảng dữ liệu thô).
   - Xuất file **PDF** định dạng văn bản hành chính DLU, nhúng font Unicode tiếng Việt Roboto không bao giờ lỗi font.

---

## 👥 Danh Sách Tài Khoản Mẫu Để Chấm Điểm / Demo

Hệ thống được khởi tạo sẵn dữ liệu mẫu thực tế của Trường Đại học Đà Lạt:

| Vai trò | Tài khoản / Email | Mật khẩu | Họ và Tên / Chức vụ | Quyền hạn chính |
| :--- | :--- | :---: | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin@dlu.edu.vn` | `admin123` | Quản trị viên Hệ thống DLU | Toàn quyền quản trị, xem Audit Logs, quản lý tài khoản |
| **Cán bộ khảo sát (STAFF)** | `canbo.cntt@dlu.edu.vn` | `canbo123` | ThS. Nguyễn Văn Hải | Trợ lý Đào tạo Khoa CNTT. Tạo, sửa, phát hành khảo sát, xuất báo cáo |
| **Cán bộ ĐBCL (STAFF)** | `canbo.dbcl@dlu.edu.vn` | `canbo123` | Trần Thị Thu Hà | Phòng Đảm bảo Chất lượng. Khảo sát toàn trường DLU |
| **Sinh viên K45 (STUDENT)** | `2111234@dlu.edu.vn` *(hoặc `2111234`)* | `123456` | Trần Văn An (Lớp CTK45) | Làm khảo sát áp dụng cho Khoa CNTT / Toàn trường |
| **Sinh viên K46 (STUDENT)** | `2211236@dlu.edu.vn` *(hoặc `2211236`)* | `123456` | Phạm Minh Cường (Lớp CTK46) | Làm khảo sát áp dụng cho Khoa CNTT / Toàn trường |
| **Sinh viên K47 (STUDENT)** | `2311238@dlu.edu.vn` *(hoặc `2311238`)* | `123456` | Đặng Quốc Hùng (Lớp CTK47) | Làm khảo sát áp dụng cho Khoa CNTT / Toàn trường |
| **Sinh viên K48 (STUDENT)** | `2411270@dlu.edu.vn` *(hoặc `2411270`)* | `123456` | Nguyễn Trọng Phúc (Lớp CTK48) | Làm khảo sát áp dụng cho Khoa CNTT / Toàn trường |

*Ghi chú: Sinh viên cũng có thể đăng nhập trực tiếp bằng bất kỳ tài khoản Google Workspace nào có đuôi `@dlu.edu.vn`.*

---

## 🛠️ Công Nghệ & Kiến Trúc Hệ Thống

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js, React-Chartjs-2, QRCode.react, Axios.
- **Backend:** Node.js (≥ 20), Express 4 (Mô hình phân tầng `Route - Controller - Service - Data Access`).
- **Cơ sở dữ liệu:** SQLite chế độ WAL (`node:sqlite`), chuẩn hóa dạng chuẩn 3 (3NF), 9 bảng, 7 chỉ mục hiệu năng cao.
- **Bảo mật:** JWT (JSON Web Token), `bcryptjs` (salt 10 rounds), kiểm soát CORS đa nguồn động, kiểm tra quyền RBAC tức thời trên CSDL.
- **Xử lý tài liệu:** `ExcelJS` (báo cáo bảng tính tự động kẻ ô), `PDFKit` (báo cáo văn bản nhúng font Unicode).
- **Mẫu thiết kế (Design Patterns):** Layered Architecture, Singleton, Facade, Chain of Responsibility, Factory Function, Provider & Observer.

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Development)

### 1. Yêu cầu môi trường:
- Node.js version ≥ 20.x
- Trình quản lý gói npm

### 2. Cài đặt các thư viện:
```bash
# Clone dự án từ GitHub
git clone https://github.com/2312741-sudo/webkhaosatdlu.git
cd webkhaosatdlu

# Cài đặt dependencies cho cả Root, Client và Server
npm install
npm --prefix client install
npm --prefix server install
```

### 3. Khởi tạo dữ liệu mẫu sạch (Seed Data):
```bash
npm run seed
```
*Lệnh này sẽ tự động khởi tạo cấu trúc CSDL và nạp sẵn 4 Khoa, 14 tài khoản mẫu, 3 phiếu khảo sát và các phản hồi mẫu.*

### 4. Chạy ứng dụng:
Mở 2 cửa sổ Terminal:
```bash
# Terminal 1: Chạy Backend API (Cổng 5001)
npm run server

# Terminal 2: Chạy Frontend Client (Cổng 5173)
npm run client
```
Mở trình duyệt truy cập: `http://localhost:5173`

### 5. Chạy bộ kiểm thử tự động (Automated Test Suite):
```bash
npm run test
```
*Hệ thống sẽ chạy kiểm thử 100% tự động qua 6 Module nghiệp vụ và trả về kết quả chi tiết.*

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
webkhaosatdlu/
├── BAO_CAO.md                 # Toàn văn Báo cáo chuyên ngành chi tiết
├── WIKI.md                    # Tài liệu kiến trúc, ERD CSDL & API Reference
├── README.md                  # Tài liệu tổng quan dự án & hướng dẫn chấm bài
├── package.json               # Root scripts điều khiển toàn bộ dự án
│
├── server/                    # MÃ NGUỒN BACKEND API (Node.js + Express)
│   ├── src/
│   │   ├── config/            # Cấu hình CSDL (db.js) và JWT (jwt.js)
│   │   ├── controllers/       # Tiếp nhận và điều hướng HTTP Request / Response
│   │   ├── services/          # Xử lý logic nghiệp vụ cốt lõi (Business Logic)
│   │   ├── models/            # Lược đồ bảng CSDL và chỉ mục (schema.js)
│   │   ├── middlewares/       # Xác thực JWT, Phân quyền RBAC, Bắt lỗi tập trung
│   │   ├── routes/            # Khai báo các API Endpoints
│   │   ├── seeders/           # Dữ liệu khởi tạo mẫu chuẩn DLU (seedData.js)
│   │   ├── utils/             # Trình xuất Excel (.xlsx), PDF, Audit Logger
│   │   └── server.js          # Điểm khởi động máy chủ API
│   └── test/
│       └── api.test.js        # Bộ kiểm thử tự động toàn diện 6 module
│
└── client/                    # MÃ NGUỒN FRONTEND (React 18 + Tailwind CSS)
    ├── src/
    │   ├── assets/            # Logo DLU và hình ảnh nhận diện
    │   ├── components/        # UI dùng chung (Navbar, Footer, Modal, Charts, QR)
    │   ├── contexts/          # AuthContext (phiên làm việc), ToastContext (thông báo)
    │   ├── pages/             # 12 Trang giao diện chức năng:
    │   │   ├── auth/          # LoginPage, GoogleCallbackPage
    │   │   ├── student/       # StudentSurveysPage, TakeSurveyPage, SurveySuccessPage
    │   │   ├── staff/         # SurveyListPage, SurveyEditorPage, QuestionBuilderPage
    │   │   ├── analytics/     # SurveyAnalyticsPage, SurveyHistoryPage
    │   │   └── admin/         # UserManagementPage, AuditLogPage
    │   ├── services/          # api.js (Axios auto gắn JWT và bắt lỗi timeout)
    │   └── App.jsx            # Định tuyến React Router & ProtectedRoute
    └── vercel.json            # Cấu hình định tuyến Single Page App trên Vercel
```

---

## ⚙️ Cấu Hình Biến Môi Trường (Environment Variables)

### Backend (`server/.env`):
```env
PORT=5001
NODE_ENV=production
JWT_SECRET=chuoi_bi_mat_ngau_nhien_toi_thieu_32_ky_tu_dlu_survey_2026
CLIENT_URL=https://webkhaosatdlu.vercel.app,http://localhost:5173
ALLOW_DEV_GOOGLE_LOGIN=true
TRUST_PROXY=1
```

### Frontend (`client/.env`):
```env
VITE_API_URL=https://webkhaosatdlu.onrender.com
# VITE_GOOGLE_CLIENT_ID=optional_oauth_client_id_from_google_cloud
```

---

## 📜 Giấy Phép & Bản Quyền

Đồ án được thực hiện bởi nhóm sinh viên Khoa Công nghệ Thông tin — Trường Đại học Đà Lạt.  
Dành riêng cho mục đích học tập, nghiên cứu và đánh giá học phần chuyên ngành.  
Bản quyền © 2026 Nhóm tác giả 2312741, 2312800, 2312774.
