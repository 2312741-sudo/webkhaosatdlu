import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
  (response) => response,
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
