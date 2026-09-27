import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import DLULogo from '../../assets/DLULogo';
import api from '../../services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Giải mã an toàn JWT payload tương thích mọi trình duyệt (Safari, Chrome, Firefox)
function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
      b64 += '=';
    }
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn('Lỗi giải mã JWT client-side:', e);
    return null;
  }
}

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: toastError } = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleResponse = async () => {
      try {
        // 1. Phân tích cả hash lẫn query parameters trả về từ Google
        const rawHash = location.hash.startsWith('#') ? location.hash.substring(1) : location.hash;
        const rawSearch = location.search.startsWith('?') ? location.search.substring(1) : location.search;
        const hashParams = new URLSearchParams(rawHash);
        const searchParams = new URLSearchParams(rawSearch);

        const idToken = hashParams.get('id_token') || searchParams.get('id_token');
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const code = hashParams.get('code') || searchParams.get('code');
        const error = hashParams.get('error') || searchParams.get('error') || hashParams.get('error_description');

        if (error) {
          throw new Error(`Google trả về lỗi xác thực: ${error}`);
        }

        let userEmail = '';
        let userFullName = '';
        const credential = idToken || accessToken;

        // 2. Thử giải mã trực tiếp từ ID Token JWT
        if (idToken) {
          const payload = parseJwtPayload(idToken);
          if (payload) {
            userEmail = payload.email || '';
            userFullName = payload.name || `${payload.family_name || ''} ${payload.given_name || ''}`.trim();
          }
        }

        // 3. Nếu chưa có email và có access_token, gọi Google UserInfo API
        if (!userEmail && accessToken) {
          const userinfoEndpoints = [
            'https://openidconnect.googleapis.com/v1/userinfo',
            'https://www.googleapis.com/oauth2/v3/userinfo'
          ];
          for (const endpoint of userinfoEndpoints) {
            try {
              const userInfoRes = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              if (userInfoRes.ok) {
                const info = await userInfoRes.json();
                if (info.email) {
                  userEmail = info.email;
                  userFullName = info.name || `${info.family_name || ''} ${info.given_name || ''}`.trim() || userFullName;
                  break;
                }
              }
            } catch (e) {
              console.warn(`Không thể lấy userinfo từ ${endpoint}:`, e);
            }
          }
        }

        // 4. Kiểm tra miền email @dlu.edu.vn nếu đã lấy được email
        if (userEmail && !userEmail.toLowerCase().endsWith('@dlu.edu.vn')) {
          setErrorMessage(`Email ${userEmail} không thuộc tên miền @dlu.edu.vn của Trường Đại học Đà Lạt!`);
          setLoading(false);
          return;
        }

        // 5. Gửi token và email Google lên server backend
        if (credential || accessToken || userEmail || code) {
          const res = await api.post('/auth/google-dlu', {
            idToken: credential,
            credential: credential,
            accessToken,
            email: userEmail,
            fullName: userFullName,
            code
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

        throw new Error('Không nhận được thông tin xác thực hợp lệ từ Google.');
      } catch (err) {
        console.error('Lỗi xác thực Google:', err);
        let msg = err.response?.data?.message || err.message || 'Đăng nhập Google thất bại.';
        if (err.message === 'Network Error' || !err.response) {
          msg = 'Không thể kết nối đến Backend Server (Network Error). Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.';
        }
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
            <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate('/login?googleDirect=1')}
                className="w-full py-2.5 px-4 rounded-xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-hover transition shadow cursor-pointer active:scale-95"
              >
                Nhập trực tiếp Email Google DLU (@dlu.edu.vn)
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Quay lại trang Đăng nhập
              </button>
            </div>
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
