import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  History, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  BarChart3, 
  Calendar, 
  Users, 
  Building2,
  Sparkles,
  Download
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function SurveyHistoryPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, yearFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = '/reports/history';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (yearFilter) params.append('year', yearFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setSurveys(res.data.data);
      }
    } catch (e) {
      toastError('Không thể tải lịch sử khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleExportExcel = async (surveyId, title) => {
    try {
      const res = await api.get(`/reports/surveys/${surveyId}/excel`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DLU_BaoCao_${surveyId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success(`Đã xuất báo cáo Excel cho "${title}"`);
    } catch (error) {
      toastError('Lỗi khi tải file Excel.');
    }
  };

  const handleExportPdf = async (surveyId, title) => {
    try {
      const res = await api.get(`/reports/surveys/${surveyId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DLU_BaoCao_${surveyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success(`Đã xuất báo cáo PDF cho "${title}"`);
    } catch (error) {
      toastError('Lỗi khi tải file PDF.');
    }
  };

  return (
    <DashboardLayout
      title="LỊCH SỬ KHẢO SÁT & XUẤT BÁO CÁO TỔNG HỢP"
      subtitle="Tra cứu kết quả các kỳ khảo sát theo năm học, học kỳ và xuất báo cáo chuẩn định dạng Excel & PDF"
    >
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khảo sát..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dlu-primary"
          >
            <option value="">Tất cả năm học</option>
            <option value="2026">Năm học 2026</option>
            <option value="2025">Năm học 2025</option>
            <option value="2024">Năm học 2024</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dlu-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đang mở (PUBLISHED)</option>
            <option value="CLOSED">Đã đóng (CLOSED)</option>
            <option value="DRAFT">Bản nháp (DRAFT)</option>
          </select>
        </div>
      </div>

      {/* Survey History List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-semibold">Đang truy xuất lịch sử khảo sát...</p>
        </div>
      ) : surveys.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <History className="w-8 h-8 text-dlu-primary" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy khảo sát nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Thử thay đổi bộ lọc tìm kiếm hoặc năm học để hiển thị kết quả.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge status={survey.status} />
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {survey.response_count} lượt sinh viên phản hồi
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {survey.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {survey.description || 'Không có mô tả.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                  <span>Khoa/Đơn vị: <strong className="text-slate-700">{survey.faculty_name || 'Toàn trường'}</strong></span>
                  <span>•</span>
                  <span>Người khởi tạo: <strong className="text-slate-700">{survey.creator_name}</strong></span>
                  {survey.start_time && (
                    <>
                      <span>•</span>
                      <span>Thời gian: {new Date(survey.start_time).toLocaleDateString('vi-VN')} - {new Date(survey.end_time).toLocaleDateString('vi-VN')}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <Link
                  to={`/analytics/${survey.id}`}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <BarChart3 className="w-4 h-4 text-dlu-primary" />
                  <span>Trực quan</span>
                </Link>

                <button
                  onClick={() => handleExportExcel(survey.id, survey.title)}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-emerald-200 shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Xuất Excel</span>
                </button>

                <button
                  onClick={() => handleExportPdf(survey.id, survey.title)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-rose-200 shadow-sm"
                >
                  <FileText className="w-4 h-4 text-dlu-red" />
                  <span>Xuất PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
