import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ShieldCheck, Search, Filter, Clock, User, Activity } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const { error: toastError } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/users/audit-logs';
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      toastError('Không thể tải nhật ký hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadge = (action) => {
    if (action.includes('LOGIN')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">ĐĂNG NHẬP</span>;
    }
    if (action.includes('CREATE') || action.includes('REGISTER')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">TẠO MỚI</span>;
    }
    if (action.includes('SUBMIT')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">NỘP KHẢO SÁT</span>;
    }
    if (action.includes('DELETE')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">XÓA</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{action}</span>;
  };

  return (
    <DashboardLayout
      title="NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG (AUDIT LOGS)"
      subtitle="Theo dõi và ghi nhận đầy đủ các thao tác: đăng nhập Google DLU, tạo biểu mẫu, nộp phiếu khảo sát và phân quyền người dùng"
    >
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo chi tiết, IP, hành động..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dlu-primary"
          >
            <option value="">Tất cả hành động</option>
            <option value="LOGIN">Đăng nhập</option>
            <option value="GOOGLE_LOGIN">Đăng nhập Google</option>
            <option value="SUBMIT_RESPONSE">Nộp câu trả lời</option>
            <option value="CREATE_SURVEY">Tạo khảo sát</option>
            <option value="PUBLISH_SURVEY">Mở khảo sát</option>
            <option value="CHANGE_PASSWORD">Đổi mật khẩu</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-3 font-semibold">Đang truy xuất nhật ký hệ thống...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-700">Chưa có nhật ký hoạt động nào</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Thời gian</th>
                  <th className="py-4 px-4">Người thực hiện</th>
                  <th className="py-4 px-4">Hành động</th>
                  <th className="py-4 px-6">Chi tiết thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {log.user_name ? (
                        <div>
                          <span className="font-bold text-slate-800">{log.user_name}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{log.user_email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Khách / Hệ thống</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
