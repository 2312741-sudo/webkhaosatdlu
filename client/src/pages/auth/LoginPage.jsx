import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import DLULogo from '../../assets/DLULogo';
import HeroBanner from '../../components/common/HeroBanner';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  UserCheck, 
  Shield, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Info,
  User,
  Building2
} from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal Direct Google DLU SSO
  const [isManualGoogleModalOpen, setIsManualGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleFullName, setGoogleFullName] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleRedirectAfterLogin = (user) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (user.role === 'STUDENT') {
      navigate('/student/surveys');
    } else {
      navigate('/staff/surveys');
    }
  };

  /**
   * Chuyển hướng sang Google OAuth2 nếu đã có Client ID, hoặc mở Modal nhập Google DLU trực tiếp
   */
  const handleRedirectToGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Nếu chưa cấu hình Google OAuth Client ID từ Google Cloud Console -> mở Modal Google DLU để đăng nhập ngay
    if (!clientId || clientId.includes('dlu-survey-oauth-client') || clientId.includes('placeholder')) {
      setGoogleError('');
      setIsManualGoogleModalOpen(true);
      return;
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
    const scope = encodeURIComponent('openid email profile');
    const hd = 'dlu.edu.vn';
    const responseType = 'token id_token';
    const nonce = Math.random().toString(36).substring(2);

    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${encodeURIComponent(responseType)}&scope=${scope}&hd=${hd}&prompt=select_account&nonce=${nonce}`;

    window.location.href = googleOAuthUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toastError('Vui lòng nhập tài khoản/email trường DLU và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier, password);
      success(`Xin chào ${user.fullName}, đăng nhập thành công!`);
      handleRedirectAfterLogin(user);
    } catch (err) {
      toastError(err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleAuth = async (e) => {
    if (e) e.preventDefault();
    setGoogleError('');

    const cleanEmail = googleEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setGoogleError('Vui lòng nhập địa chỉ Email Google trường DLU của bạn.');
      return;
    }

    if (!cleanEmail.endsWith('@dlu.edu.vn')) {
      setGoogleError('❌ LỖI: Chỉ tài khoản Google có đuôi @dlu.edu.vn của Trường Đại học Đà Lạt mới được phép đăng nhập!');
      return;
    }

    if (!googleFullName.trim()) {
      setGoogleError('Vui lòng nhập Họ và Tên của bạn để hệ thống ghi nhận.');
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await api.post('/auth/google-dlu', {
        email: cleanEmail,
        fullName: googleFullName.trim()
      });

      if (res.data.success) {
        const { token, user: userData } = res.data.data;
        localStorage.setItem('dlu_survey_token', token);
        localStorage.setItem('dlu_survey_user', JSON.stringify(userData));
        success(`Đăng nhập Google DLU thành công! Chào mừng ${userData.fullName}.`);
        setIsManualGoogleModalOpen(false);
        window.location.href = userData.role === 'STUDENT' ? '/student/surveys' : '/staff/surveys';
      }
    } catch (err) {
      setGoogleError(err.response?.data?.message || 'Không thể đăng nhập bằng tài khoản Google DLU.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickLogin = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
  };

  return (
    <div className="bg-dlu-bg">
      {/* 1. Official DLU Hero Banner */}
      <HeroBanner 
        title="HỆ THỐNG KHẢO SÁT MỨC ĐỘ HÀI LÒNG CỦA SINH VIÊN"
        subtitle="Cổng thông tin tiếp nhận ý kiến phản hồi về chất lượng đào tạo, cơ sở vật chất và dịch vụ hỗ trợ của Trường Đại học Đà Lạt."
      />

      {/* 2. Login Form Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Cột trái: Giới thiệu mục đích khảo sát & Triết lý DLU */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4 text-dlu-primary font-bold text-lg">
                <Building2 className="w-6 h-6 text-dlu-accent" />
                <span>Mục đích của Hệ thống Khảo sát DLU</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Nhằm nâng cao chất lượng giáo dục và đáp ứng tốt nhất nhu cầu học tập của sinh viên, Khoa Công nghệ Thông tin triển khai hệ thống khảo sát trực tuyến thường niên. Ý kiến phản hồi của các bạn sinh viên là căn cứ quan trọng để:
              </p>
              
              <ul className="mt-4 space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dlu-primary flex-shrink-0 mt-0.5" />
                  <span>Cải tiến chương trình đào tạo, nội dung bài giảng và phương pháp giảng dạy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dlu-primary flex-shrink-0 mt-0.5" />
                  <span>Nâng cấp cấu hình phòng máy thực hành (A27, A28), đường truyền mạng và trang thiết bị.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-dlu-primary flex-shrink-0 mt-0.5" />
                  <span>Tăng cường hoạt động ngoại khóa, hội thảo kỹ năng thực chiến và kết nối doanh nghiệp IT.</span>
                </li>
              </ul>

              <div className="mt-5 p-3.5 bg-dlu-light/70 border border-dlu-primary/20 rounded-2xl flex items-center justify-between text-xs text-dlu-dark font-semibold">
                <span>Triết lý giáo dục:</span>
                <span className="text-dlu-primary font-serif font-bold italic text-sm">"Thụ nhân – Khai phóng – Bản sắc"</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Form Đăng nhập */}
          <div className="lg:col-span-5">
            <div className="bg-white p-7 sm:p-8 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-dlu-primary via-dlu-accent to-dlu-gold"></div>

              <div className="text-center mb-6">
                <h2 className="text-lg sm:text-xl font-black text-dlu-primary uppercase tracking-tight">
                  Đăng nhập Hệ thống
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sử dụng tài khoản Email trường DLU (<span className="font-mono text-dlu-primary font-bold">@dlu.edu.vn</span>)
                </p>
              </div>

              {/* Nút Đăng nhập Google trực tiếp */}
              <div className="space-y-2 mb-5">
                <button
                  type="button"
                  onClick={handleRedirectToGoogleOAuth}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-dlu-primary bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition group"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1 font-bold text-slate-800 group-hover:text-dlu-primary text-xs sm:text-sm">
                      <span>Đăng nhập với Google DLU</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-dlu-primary" />
                    </div>
                    <span className="text-[10px] text-dlu-accent font-bold">
                      Chỉ cho phép tài khoản @dlu.edu.vn
                    </span>
                  </div>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleError('');
                      setIsManualGoogleModalOpen(true);
                    }}
                    className="text-[11px] text-slate-500 hover:text-dlu-primary underline font-medium"
                  >
                    Nhập email Google DLU nếu chạy trên máy cục bộ (Localhost)
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hoặc đăng nhập mật khẩu
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* Standard Login Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email trường DLU / Mã số sinh viên
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="VD: 2312741@dlu.edu.vn hoặc 2312741"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary font-medium transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mật khẩu mặc định: 123456"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary font-medium transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm font-bold text-white bg-dlu-primary hover:bg-dlu-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dlu-primary transition duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Đăng nhập hệ thống</span>
                      <ArrowRight className="w-4 h-4 text-dlu-accent" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-dlu-accent" />
                  <span>Tài khoản mẫu đầy đủ Họ & Tên (Demo Hội đồng):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('2111234@dlu.edu.vn', '123456')}
                    className="p-2 rounded-xl bg-dlu-light border border-dlu-primary/20 hover:bg-dlu-light/80 text-[11px] font-bold text-dlu-dark text-center transition flex flex-col items-center gap-0.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-dlu-primary" />
                    <span>Trần Văn An</span>
                    <span className="text-[9px] text-slate-600 font-normal">SV K45 • CTK45</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('2211236@dlu.edu.vn', '123456')}
                    className="p-2 rounded-xl bg-dlu-light border border-dlu-primary/20 hover:bg-dlu-light/80 text-[11px] font-bold text-dlu-dark text-center transition flex flex-col items-center gap-0.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-dlu-primary" />
                    <span>Phạm M. Cường</span>
                    <span className="text-[9px] text-slate-600 font-normal">SV K46 • CTK46</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('canbo.cntt@dlu.edu.vn', 'canbo123')}
                    className="p-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-[11px] font-bold text-amber-900 text-center transition flex flex-col items-center gap-0.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                    <span>ThS. N.V. Hải</span>
                    <span className="text-[9px] text-amber-800 font-normal">Cán bộ CNTT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@dlu.edu.vn', 'admin123')}
                    className="p-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-[11px] font-bold text-rose-900 text-center transition flex flex-col items-center gap-0.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-dlu-red" />
                    <span>Quản trị viên</span>
                    <span className="text-[9px] text-rose-800 font-normal">Admin DLU</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Google DLU Authentication Modal */}
      <Modal
        isOpen={isManualGoogleModalOpen}
        onClose={() => setIsManualGoogleModalOpen(false)}
        title="Đăng nhập Google Workspace DLU"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleManualGoogleAuth} className="space-y-4">
          <div className="p-3.5 bg-dlu-light border border-dlu-primary/30 rounded-2xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-dlu-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-dlu-dark leading-relaxed font-medium">
              Chỉ chấp nhận các tài khoản Google có đuôi <strong className="text-dlu-primary font-mono">@dlu.edu.vn</strong> của Trường Đại học Đà Lạt.
            </p>
          </div>

          {googleError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 font-bold animate-pulse">
              <AlertCircle className="w-4 h-4 text-dlu-red flex-shrink-0 mt-0.5" />
              <span>{googleError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Google trường DLU (@dlu.edu.vn) <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={googleEmail}
              onChange={(e) => {
                setGoogleEmail(e.target.value);
                setGoogleError('');
              }}
              placeholder="VD: 2312741@dlu.edu.vn"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary font-medium font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Họ và Tên của bạn (Tên tài khoản Google) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={googleFullName}
                onChange={(e) => {
                  setGoogleFullName(e.target.value);
                  setGoogleError('');
                }}
                placeholder="VD: Nguyễn Văn Hoàng"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsManualGoogleModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={googleLoading}
              className="px-5 py-2.5 rounded-xl bg-dlu-primary hover:bg-dlu-hover text-white text-xs font-bold shadow transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-dlu-accent" />
                  <span>Xác thực & Vào hệ thống</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
