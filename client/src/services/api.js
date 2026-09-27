import axios from 'axios';

const getBaseUrl = () => {
  // 1. Lấy từ biến môi trường VITE_API_URL (cấu hình trên Vercel Project Settings)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  // 2. Cho phép cấu hình qua localStorage ('dlu_api_url') để test nhanh nếu cần
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('dlu_api_url');
    if (customUrl) {
      const url = customUrl.replace(/\/+$/, '');
      return url.endsWith('/api') ? url : `${url}/api`;
    }
  }
  // 3. Fallback mặc định
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // Chờ 60s phòng trường hợp Render Backend đang khởi động từ chế độ ngủ (Free tier)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Gắn JWT token vào mọi request tự động
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dlu_survey_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response lỗi tập trung
api.interceptors.response.use(
  (response) => {
    // Phát hiện trường hợp Vercel rewrite /api sang index.html (trả về HTML thay vì JSON API)
    if (
      typeof response.data === 'string' &&
      response.data.trim().toLowerCase().startsWith('<!doctype html')
    ) {
      const err = new Error(
        'Vercel đang trả về trang HTML thay vì kết nối đến Backend Server API. Vui lòng kiểm tra lại biến môi trường VITE_API_URL trên Vercel.'
      );
      err.isVercelRewriteError = true;
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hết hạn token hoặc chưa đăng nhập
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('dlu_survey_token');
        localStorage.removeItem('dlu_survey_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
