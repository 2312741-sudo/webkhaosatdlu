import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DLULogo from '../../assets/DLULogo';
import ProfileModal from './ProfileModal';
import { 
  LogOut, 
  ClipboardList, 
  PlusCircle, 
  History, 
  Users, 
  ShieldCheck, 
  Menu, 
  X, 
  Mail, 
  Phone, 
  ExternalLink,
  User,
  Settings,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/staff/surveys' && (location.pathname.startsWith('/staff/surveys') && location.pathname !== '/staff/surveys/create')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <header className="shadow-md sticky top-0 z-40">
      {/* 1. Top Utility Header Bar - Màu tối (#0F5132 / #0B281F) */}
      <div className="bg-[#0B281F] text-slate-200 text-[11px] px-4 py-1.5 border-b border-dlu-primary/40">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2 font-medium">
          <div className="flex items-center gap-4">
            <span className="font-bold text-dlu-accent uppercase tracking-wider">CỔNG THÔNG TIN KHẢO SÁT TRỰC TUYẾN DLU</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <div className="hidden sm:flex items-center gap-1 text-slate-300">
              <Mail className="w-3 h-3 text-dlu-accent" />
              <span>it@dlu.edu.vn</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-slate-300">
              <Phone className="w-3 h-3 text-dlu-accent" />
              <span>(0263) 3822246</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="italic font-serif text-dlu-accent/90">"Thụ nhân – Khai phóng – Bản sắc"</span>
            <span className="text-white/30">|</span>
            <a 
              href="https://dlu.edu.vn" 
              target="_blank" 
              rel="noreferrer"
              className="text-dlu-accent hover:text-yellow-300 hover:underline flex items-center gap-0.5 font-bold transition"
            >
              <span>dlu.edu.vn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main University Brand Header - Nền Trắng Sáng với Logo Thật DLU */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Brand Logo & Institution Titles */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <DLULogo className="w-13 h-13 sm:w-15 sm:h-15 group-hover:scale-105 transition-transform duration-300 flex-shrink-0" />
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-dlu-red uppercase tracking-wider leading-tight">
                BỘ GIÁO DỤC VÀ ĐÀO TẠO
              </div>
              <div className="text-base sm:text-xl font-black text-dlu-primary tracking-tight leading-tight group-hover:text-dlu-dark transition">
                TRƯỜNG ĐẠI HỌC ĐÀ LẠT
              </div>
              <div className="text-xs sm:text-sm font-bold text-dlu-accent leading-tight">
                KHOA CÔNG NGHỆ THÔNG TIN
              </div>
            </div>
          </Link>

          {/* User Profile on Right */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Bấm để xem/sửa hồ sơ sinh viên"
                className="hidden sm:flex items-center gap-2.5 p-1.5 px-3 rounded-2xl hover:bg-slate-100 transition text-right group border border-transparent hover:border-slate-200"
              >
                <div className="flex flex-col text-right">
                  <div className="text-sm font-extrabold text-slate-900 leading-tight group-hover:text-dlu-primary transition flex items-center justify-end gap-1">
                    <span>{user.fullName}</span>
                    <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-dlu-primary" />
                  </div>
                  <div className="text-xs text-dlu-primary font-bold">
                    {user.role === 'ADMIN' && '⭐ Quản trị viên'}
                    {user.role === 'STAFF' && '🎓 Cán bộ khảo sát'}
                    {user.role === 'STUDENT' && `Sinh viên ${user.studentCode || ''} (Lớp ${user.className || 'CTK47'})`}
                  </div>
                </div>
              </button>

              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-dlu-red border border-rose-200 text-xs font-bold transition shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-dlu-primary hover:bg-dlu-hover text-white font-bold text-xs transition shadow border border-dlu-dark"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* 3. Deep Moss Green Navigation Bar (#1B4D3E) with Ochre Gold Border (#C9A227) */}
      <div className="bg-dlu-primary text-white border-b-2 border-dlu-accent px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-11">
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
            {isAuthenticated ? (
              <>
                {user.role === 'STUDENT' && (
                  <Link
                    to="/student/surveys"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                      isActive('/student/surveys')
                        ? 'bg-dlu-dark text-dlu-accent shadow font-black border border-dlu-accent/40'
                        : 'text-slate-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 text-dlu-accent" />
                    Khảo sát của tôi
                  </Link>
                )}

                {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                  <>
                    <Link
                      to="/staff/surveys"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                        isActive('/staff/surveys')
                          ? 'bg-dlu-dark text-dlu-accent shadow font-black border border-dlu-accent/40'
                          : 'text-slate-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-dlu-accent" />
                      Quản lý Khảo sát
                    </Link>

                    <Link
                      to="/staff/surveys/create"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                        isActive('/staff/surveys/create')
                          ? 'bg-dlu-dark text-dlu-accent shadow font-black border border-dlu-accent/40'
                          : 'text-slate-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 text-dlu-accent" />
                      Tạo khảo sát
                    </Link>

                    <Link
                      to="/analytics/history"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                        isActive('/analytics/history')
                          ? 'bg-dlu-dark text-dlu-accent shadow font-black border border-dlu-accent/40'
                          : 'text-slate-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <History className="w-4 h-4 text-dlu-accent" />
                      Lịch sử & Báo cáo
                    </Link>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin/users"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                        isActive('/admin/users')
                          ? 'bg-dlu-dark text-dlu-accent shadow font-black border border-dlu-accent/40'
                          : 'text-slate-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4 text-dlu-accent" />
                      Quản lý Người dùng
                    </Link>
                    <Link
                      to="/admin/audit-logs"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition ${
                        isActive('/admin/audit-logs')
                          ? 'bg-dlu-dark text-dlu-accent shadow font-black border border-dlu-accent/40'
                          : 'text-slate-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-dlu-accent" />
                      Nhật ký Hệ thống
                    </Link>
                  </>
                )}
              </>
            ) : (
              <span className="text-slate-200 py-1 font-medium">Hệ thống khảo sát trực tuyến chất lượng đào tạo DLU</span>
            )}
          </nav>

          <div className="text-[11px] text-dlu-accent font-bold hidden md:block">
            Khoa CNTT – Trường Đại học Đà Lạt
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 flex flex-col gap-1 pb-3 text-xs">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsProfileModalOpen(true);
              }}
              className="text-left px-3 py-2 bg-dlu-dark rounded-lg text-white font-bold mb-1 border border-dlu-accent/30"
            >
              <div>{user.fullName}</div>
              <div className="text-[10px] text-dlu-accent">Bấm để chỉnh sửa hồ sơ sinh viên</div>
            </button>

            {user.role === 'STUDENT' && (
              <Link
                to="/student/surveys"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10"
              >
                <ClipboardList className="w-4 h-4 text-dlu-accent" />
                Khảo sát của tôi
              </Link>
            )}

            {(user.role === 'STAFF' || user.role === 'ADMIN') && (
              <>
                <Link
                  to="/staff/surveys"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10"
                >
                  <LayoutDashboard className="w-4 h-4 text-dlu-accent" />
                  Quản lý Khảo sát
                </Link>
                <Link
                  to="/staff/surveys/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10"
                >
                  <PlusCircle className="w-4 h-4 text-dlu-accent" />
                  Tạo khảo sát
                </Link>
                <Link
                  to="/analytics/history"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10"
                >
                  <History className="w-4 h-4 text-dlu-accent" />
                  Lịch sử & Báo cáo
                </Link>
              </>
            )}

            {user.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/users"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10"
                >
                  <Users className="w-4 h-4 text-dlu-accent" />
                  Quản lý Người dùng
                </Link>
                <Link
                  to="/admin/audit-logs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10"
                >
                  <ShieldCheck className="w-4 h-4 text-dlu-accent" />
                  Nhật ký Hệ thống
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Student Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
}
