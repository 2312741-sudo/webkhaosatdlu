import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import DLULogo from '../../assets/DLULogo';
import api from '../../services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: toastError } = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleResponse = async () => {
      try {
        // 1. Phân tích hash hoặc query parameters trả về từ Google
        const hash = location.hash.substring(1);
        const search = location.search.substring(1);
        const params = new URLSearchParams(hash || search);

        const idToken = params.get('id_token');
        const accessToken = params.get('access_token');
        const code = params.get('code');
        const error = params.get('error');

        if (error) {
          throw new Error(`Google trả về lỗi: ${error}`);
        }

        let userEmail = '';
        let userFullName = '';
        let credential = idToken;

        // 2. Nếu có access_token từ Google, gọi Google UserInfo API
        if (accessToken) {
          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userInfoRes.ok) {
              const info = await userInfoRes.json();
              userEmail = info.email;
              userFullName = info.name || `${info.family_name || ''} ${info.given_name || ''}`.trim();
            }
          } catch (e) {
            console.warn('Không thể gọi Google UserInfo API:', e);
          }
        }

        // 3. Nếu có ID Token, decode payload từ JWT
        if (!userEmail && idToken) {
          try {
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            userEmail = payload.email;
            userFullName = payload.name;
          } catch (e) {
            console.warn('Lỗi decode ID Token:', e);
          }
        }

        // 4. Kiểm tra miền email @dlu.edu.vn
        if (userEmail && !userEmail.toLowerCase().endsWith('@dlu.edu.vn')) {
          setErrorMessage(`Email ${userEmail} không thuộc tên miền @dlu.edu.vn của Trường Đại học Đà Lạt!`);
          setLoading(false);
          return;
        }

        // 5. Gửi lên server backend để xác thực và cấp token
        if (userEmail || credential) {
          const res = await api.post('/auth/google-dlu', {
            email: userEmail,
            fullName: userFullName,
            credential
          });

          if (res.data.success) {
            const { token, user: userData } = res.data.data;
            localStorage.setItem('dlu_survey_token', token);
            localStorage.setItem('dlu_survey_user', JSON.stringify(userData));
            success(`Đăng nhập Google DLU thành công! Chào mừng ${userData.fullName}.`);
            window.location.href = userData.role === 'STUDENT' ? '/student/surveys' : '/staff/surveys';
            return;
          }
        }

        throw new Error('Không nhận được thông tin xác thực từ Google.');
      } catch (err) {
        console.error('Lỗi xác thực Google:', err);
        const msg = err.response?.data?.message || err.message || 'Đăng nhập Google thất bại.';
        setErrorMessage(msg);
        toastError(msg);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleResponse();
  }, [location]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 bg-dlu-bg">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
        <div className="flex justify-center mb-4">
          <DLULogo className="w-16 h-16" />
        </div>

        {loading ? (
          <div>
            <div className="w-10 h-10 border-4 border-dlu-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-base font-bold text-slate-800">Đang đồng bộ tài khoản Google DLU...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống đang đọc thông tin sinh viên từ Google Workspace Trường Đại học Đà Lạt.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-rose-700">Đăng nhập không thành công</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-royal transition shadow"
            >
              Quay lại trang Đăng nhập
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Đăng nhập thành công!</h3>
            <p className="text-xs text-slate-500 mt-1">Đang chuyển hướng vào hệ thống...</p>
          </div>
        )}
      </div>
    </div>
  );
}
