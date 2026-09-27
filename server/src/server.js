const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initSchema } = require('./models/schema');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const responseRoutes = require('./routes/responseRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

// Kiểm tra cấu hình JWT_SECRET ngay khi khởi động (dừng server ở production nếu thiếu)
require('./config/jwt');

const app = express();
const PORT = process.env.PORT || 5001;

// Chạy sau reverse proxy (Nginx / Render) thì đặt TRUST_PROXY=1 để req.ip lấy đúng IP người dùng
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', /^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY);
}

// Chỉ cho phép các domain Frontend được khai báo trong CLIENT_URL (phân tách bằng dấu phẩy)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Middlewares
app.use(cors({
  origin(origin, callback) {
    // Cho phép request không có Origin (curl, server-to-server, ứng dụng di động)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'DLU Student Satisfaction Survey API is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Central Error Handler
app.use(errorHandler);

// Khởi tạo CSDL và khởi động Server
initSchema();

app.listen(PORT, () => {
  console.log(`🚀 Server DLU Survey API đang chạy tại: http://localhost:${PORT}`);
  console.log(`📚 Sẵn sàng phục vụ các Module 1 -> Module 6.`);
});
