import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ClipboardList, 
  PlusCircle, 
  History, 
  Users, 
  ShieldCheck, 
  GraduationCap,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

export default function DashboardLayout({ children, title, subtitle, actionButton }) {
  const { user } = useAuth();
  const location = useLocation();

  const isLinkActive = (path) => {
    if (path === '/staff/surveys' && location.pathname === '/staff/surveys') return true;
    if (path === '/staff/surveys/create' && location.pathname === '/staff/surveys/create') return true;
    if (path === '/analytics/history' && location.pathname.startsWith('/analytics')) return true;
    if (path === '/admin/users' && location.pathname === '/admin/users') return true;
    if (path === '/admin/audit-logs' && location.pathname === '/admin/audit-logs') return true;
    return false;
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-dlu-bg flex flex-col md:flex-row">
      {/* 1. Left Sidebar Navigation for Staff / Admin */}
      <aside className="w-full md:w-64 bg-[#143D31] text-white flex-shrink-0 border-r border-dlu-primary/40 p-4 sm:p-5 flex flex-col justify-between shadow-lg">
        <div className="space-y-6">
          {/* Institution Role Badge */}
          <div className="p-3 bg-[#0F5132] rounded-2xl border border-dlu-accent/30 flex items-center gap-3">
            <div className="p-2 bg-dlu-accent/20 rounded-xl text-dlu-accent">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-dlu-accent tracking-wider">
                {user?.role === 'ADMIN' ? 'HỆ THỐNG QUẢN TRỊ' : 'NGHIỆP VỤ KHẢO SÁT'}
              </div>
              <div className="text-[11px] text-slate-200 truncate font-semibold">
                {user?.fullName}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-bold">
            <div className="px-3 py-1 text-[10px] uppercase text-dlu-accent tracking-wider font-extrabold">
              Khảo sát & Báo cáo
            </div>

            <Link
              to="/staff/surveys"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                isLinkActive('/staff/surveys')
                  ? 'bg-dlu-accent text-dlu-dark shadow font-black'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Danh sách khảo sát</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <Link
              to="/staff/surveys/create"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                isLinkActive('/staff/surveys/create')
                  ? 'bg-dlu-accent text-dlu-dark shadow font-black'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>Tạo phiếu khảo sát</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <Link
              to="/analytics/history"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                isLinkActive('/analytics/history')
                  ? 'bg-dlu-accent text-dlu-dark shadow font-black'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4" />
                <span>Lịch sử & Báo cáo</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </Link>

            {user?.role === 'ADMIN' && (
              <>
                <div className="pt-4 px-3 py-1 text-[10px] uppercase text-dlu-accent tracking-wider font-extrabold">
                  Quản trị Hệ thống
                </div>

                <Link
                  to="/admin/users"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                    isLinkActive('/admin/users')
                      ? 'bg-dlu-accent text-dlu-dark shadow font-black'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>Quản lý Người dùng</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  to="/admin/audit-logs"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                    isLinkActive('/admin/audit-logs')
                      ? 'bg-dlu-accent text-dlu-dark shadow font-black'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Nhật ký Hệ thống</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/10 text-[11px] text-slate-300">
          <div className="font-bold text-dlu-accent">Khoa CNTT - ĐH Đà Lạt</div>
          <div className="italic font-serif text-[10px] mt-0.5">"Thụ nhân – Khai phóng – Bản sắc"</div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Page Header */}
        {(title || actionButton) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-dlu-primary tracking-tight uppercase">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {actionButton && <div>{actionButton}</div>}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
