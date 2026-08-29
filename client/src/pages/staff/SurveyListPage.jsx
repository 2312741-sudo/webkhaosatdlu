import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Badge from '../../components/common/Badge';
import QRModal from '../../components/survey/QRModal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  BarChart3, 
  Edit3, 
  Copy, 
  Trash2, 
  QrCode, 
  HelpCircle, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function SurveyListPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedQRSurvey, setSelectedQRSurvey] = useState(null);

  useEffect(() => {
    fetchSurveys();
  }, [statusFilter]);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      let url = '/surveys';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setSurveys(res.data.data);
      }
    } catch (error) {
      toastError('Không thể tải danh sách khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSurveys();
  };

  const handleDuplicate = async (surveyId) => {
    try {
      const res = await api.post(`/surveys/${surveyId}/duplicate`);
      if (res.data.success) {
        success('Nhân bản khảo sát thành công! Bản nháp mới đã được tạo.');
        fetchSurveys();
      }
    } catch (error) {
      toastError(error.response?.data?.message || 'Lỗi nhân bản khảo sát.');
    }
  };

  const handleStatusChange = async (surveyId, newStatus) => {
    try {
      const res = await api.patch(`/surveys/${surveyId}/status`, { status: newStatus });
      if (res.data.success) {
        success(`Đã cập nhật trạng thái khảo sát thành "${newStatus}".`);
        fetchSurveys();
      }
    } catch (error) {
      toastError(error.response?.data?.message || 'Lỗi đổi trạng thái khảo sát.');
    }
  };

  const handleDelete = async (surveyId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khảo sát này? Thao tác này không thể hoàn tác!')) {
      return;
    }

    try {
      const res = await api.delete(`/surveys/${surveyId}`);
      if (res.data.success) {
        success('Đã xóa khảo sát thành công.');
        fetchSurveys();
      }
    } catch (error) {
      toastError(error.response?.data?.message || 'Lỗi xóa khảo sát.');
    }
  };

  return (
    <DashboardLayout
      title="QUẢN LÝ PHIẾU KHẢO SÁT CHẤT LƯỢNG"
      subtitle="Thiết lập nội dung khảo sát, phát hành biểu mẫu, sinh mã QR và theo dõi tỷ lệ phản hồi"
      actionButton={
        <Link
          to="/staff/surveys/create"
          className="px-4 py-2.5 bg-dlu-primary hover:bg-dlu-hover text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
        >
          <PlusCircle className="w-4 h-4 text-dlu-accent" />
          <span>Tạo khảo sát mới</span>
        </Link>
      }
    >
      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề khảo sát..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dlu-primary w-full sm:w-auto"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp (DRAFT)</option>
            <option value="PUBLISHED">Đang mở (PUBLISHED)</option>
            <option value="CLOSED">Đã đóng (CLOSED)</option>
          </select>
        </div>
      </div>

      {/* Survey List Table / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-semibold">Đang tải dữ liệu khảo sát...</p>
        </div>
      ) : surveys.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ClipboardList className="w-8 h-8 text-dlu-primary" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Chưa có khảo sát nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Bấm nút "Tạo khảo sát mới" để bắt đầu xây dựng biểu mẫu khảo sát ý kiến sinh viên.
          </p>
          <div className="mt-5">
            <Link
              to="/staff/surveys/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-dlu-primary text-white text-xs font-bold rounded-xl shadow"
            >
              <PlusCircle className="w-4 h-4 text-dlu-accent" />
              <span>Tạo khảo sát ngay</span>
            </Link>
          </div>
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
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {survey.question_count} câu hỏi
                  </span>
                  <span className="text-[11px] font-bold text-dlu-primary bg-dlu-light px-2.5 py-0.5 rounded-full">
                    {survey.response_count} lượt nộp
                  </span>
                </div>

                <Link
                  to={`/analytics/${survey.id}`}
                  className="text-base font-bold text-slate-900 hover:text-dlu-primary transition block mb-1"
                >
                  {survey.title}
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {survey.description || 'Không có mô tả chi tiết.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                  <span>Người tạo: <strong className="text-slate-700">{survey.creator_name}</strong></span>
                  <span>•</span>
                  <span>Đơn vị: <strong className="text-slate-700">{survey.faculty_name || 'Toàn trường'}</strong></span>
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
                {/* QR Code */}
                <button
                  onClick={() => setSelectedQRSurvey(survey)}
                  title="Xem mã QR & Link làm bài"
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-dlu-primary" />
                  <span className="hidden sm:inline">QR Code</span>
                </button>

                {/* Edit Questions */}
                <Link
                  to={`/staff/surveys/${survey.id}/questions`}
                  title="Thiết kế câu hỏi"
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Bộ câu hỏi</span>
                </Link>

                {/* Analytics */}
                <Link
                  to={`/analytics/${survey.id}`}
                  title="Xem thống kê & biểu đồ"
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Báo cáo</span>
                </Link>

                {/* Duplicate */}
                <button
                  onClick={() => handleDuplicate(survey.id)}
                  title="Nhân bản khảo sát này"
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Nhân bản</span>
                </button>

                {/* Publish / Close */}
                {survey.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange(survey.id, 'PUBLISHED')}
                    className="p-2 bg-dlu-primary hover:bg-dlu-hover text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-dlu-accent" />
                    <span>Mở khảo sát</span>
                  </button>
                )}

                {survey.status === 'PUBLISHED' && (
                  <button
                    onClick={() => handleStatusChange(survey.id, 'CLOSED')}
                    className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-amber-700" />
                    <span>Đóng khảo sát</span>
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(survey.id)}
                  title="Xóa khảo sát"
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQRSurvey && (
        <QRModal
          survey={selectedQRSurvey}
          isOpen={!!selectedQRSurvey}
          onClose={() => setSelectedQRSurvey(null)}
        />
      )}
    </DashboardLayout>
  );
}
