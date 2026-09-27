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

// Cấu hình CORS linh hoạt và an toàn:
// 1. Cho phép các origin được khai báo trong CLIENT_URL (phân tách dấu phẩy hoặc '*')
// 2. Tự động cho phép localhost/127.0.0.1 (bất kỳ port nào)
// 3. Tự động cho phép tất cả các domain deploy Vercel (*.vercel.app bao gồm preview deployments)
// 4. Cho phép domain Render (*.onrender.com)
// 5. Cho phép request không có origin (curl, mobile app, server-to-server)
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const clean = origin.trim().replace(/\/$/, '');

  // Khai báo trong CLIENT_URL hoặc cấu hình wildcard '*'
  if (configuredOrigins.includes('*') || configuredOrigins.includes(clean)) {
    return true;
  }

  // Chạy cục bộ: localhost hoặc 127.0.0.1 ở bất kỳ port nào
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(clean)) {
    return true;
  }

  // Toàn bộ các domain deploy trên Vercel (*.vercel.app bao gồm cả preview branches)
  if (/^https:\/\/[a-zA-Z0-9_\.-]+\.vercel\.app$/i.test(clean)) {
    return true;
  }

  // Toàn bộ domain Render (*.onrender.com)
  if (/^https:\/\/[a-zA-Z0-9_\.-]+\.onrender\.com$/i.test(clean)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS Blocked] Origin không được phép: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Cache preflight 24h
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
