import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dlu_survey_token');
      const storedUser = localStorage.getItem('dlu_survey_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('dlu_survey_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Phiên đăng nhập hết hạn:', error);
          logout();
        }
      }
      setLoading(false);
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
