import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedToken = localStorage.getItem('dlu_survey_token');
      const storedUser = localStorage.getItem('dlu_survey_user');
      if (storedToken && storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error('Lỗi đọc dữ liệu người dùng từ localStorage:', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dlu_survey_token');
      const storedUser = localStorage.getItem('dlu_survey_user');

      if (storedToken && storedUser) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('dlu_survey_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          // CHỈ đăng xuất khi máy chủ trả về 401/403 (token hết hạn hoặc không hợp lệ)
          // KHÔNG đăng xuất nếu lỗi mạng, máy chủ đang khởi động hoặc tạm thời mất kết nối
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Phiên đăng nhập đã hết hạn:', error);
            logout();
          } else {
            console.warn('Không thể đồng bộ với máy chủ, tiếp tục duy trì phiên đăng nhập cục bộ.');
          }
        }
      }
    };

    initAuth();
  }, []);

  const login = async (identifier, password, fullName = '') => {
    const res = await api.post('/auth/login', { identifier, password, fullName });
    if (res.data.success) {
      const { token, user: userData } = res.data.data;
      localStorage.setItem('dlu_survey_token', token);
      localStorage.setItem('dlu_survey_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      const updatedUser = res.data.user;
      localStorage.setItem('dlu_survey_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('dlu_survey_token');
    localStorage.removeItem('dlu_survey_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, updateProfile, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
