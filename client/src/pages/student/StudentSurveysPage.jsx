import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../../components/common/Badge';
import HeroBanner from '../../components/common/HeroBanner';
import ProfileModal from '../../components/common/ProfileModal';
import { 
  ClipboardCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  HelpCircle,
  Sparkles,
  User,
  GraduationCap,
  Edit3,
  AlertCircle
} from 'lucide-react';

export default function StudentSurveysPage() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await api.get('/responses/student/surveys');
      if (res.data.success) {
        setSurveys(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách khảo sát sinh viên:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurveys = surveys.filter((s) => {
    if (filter === 'PENDING') return !s.has_submitted && s.status === 'PUBLISHED';
    if (filter === 'COMPLETED') return s.has_submitted;
    return true;
  });

  const pendingCount = surveys.filter(s => !s.has_submitted && s.status === 'PUBLISHED').length;
  const completedCount = surveys.filter(s => s.has_submitted).length;
  const isDefaultName = user?.fullName?.startsWith('Sinh viên ');

  return (
    <div className="bg-dlu-bg min-h-[calc(100vh-140px)]">
      {/* 1. Official DLU Hero Banner */}
      <HeroBanner 
        title="PHIẾU KHẢO SÁT DÀNH CHO SINH VIÊN"
        subtitle="Ý kiến đánh giá khách quan của bạn là động lực giúp Khoa Công nghệ Thông tin và Nhà trường hoàn thiện môi trường học tập tốt nhất."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Name Update Banner if default name */}
        {isDefaultName && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-dlu-accent/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-dlu-primary">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-amber-900">
                  Bạn chưa cập nhật Họ và Tên thật trên hệ thống
                </div>
                <div className="text-xs text-amber-800">
                  Hãy nhập Họ & Tên của bạn để nhà trường ghi nhận phản hồi chính xác.
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-4 py-2 bg-dlu-primary hover:bg-dlu-hover text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5 text-dlu-accent" />
              <span>Cập nhật Họ & Tên ngay</span>
            </button>
          </div>
        )}

        {/* Student Welcome Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-dlu-primary tracking-tight uppercase">
                  Xin chào, {user?.fullName}!
                </h1>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  title="Chỉnh sửa họ tên & lớp"
                  className="p-1.5 bg-dlu-light hover:bg-dlu-light/80 rounded-xl transition text-dlu-primary border border-dlu-primary/20"
                >
                  <Edit3 className="w-4 h-4 text-dlu-primary" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs font-semibold text-slate-700">
                <span className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  Mã SV: <strong className="text-dlu-primary font-mono text-sm">{user?.studentCode}</strong>
                </span>
                <span className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  Lớp: <strong className="text-slate-900 font-bold">{user?.className || 'CTK47'}</strong>
                </span>
                <span className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  Khóa: <strong className="text-slate-900 font-bold">{user?.academicYear || 'K47'}</strong>
                </span>
                <span className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  Khoa: <strong className="text-slate-900 font-bold">{user?.facultyName || 'Khoa Công nghệ Thông tin'}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-dlu-light/70 p-4 rounded-2xl border border-dlu-primary/20 self-start md:self-auto">
              <div className="text-center px-4 border-r border-dlu-primary/20">
                <div className="text-2xl font-black text-dlu-primary">{pendingCount}</div>
                <div className="text-[11px] text-slate-700 font-bold">Cần làm</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-black text-emerald-700">{completedCount}</div>
                <div className="text-[11px] text-slate-700 font-bold">Đã hoàn thành</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === 'ALL'
                  ? 'bg-dlu-primary text-white shadow'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Tất cả ({surveys.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filter === 'PENDING'
                  ? 'bg-dlu-dark text-dlu-accent shadow border border-dlu-accent/40 font-black'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span>Đang mở cần làm</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-dlu-accent text-dlu-dark rounded-full text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === 'COMPLETED'
                  ? 'bg-emerald-800 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Đã hoàn thành ({completedCount})
            </button>
          </div>
        </div>

        {/* Survey Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-3 font-semibold">Đang tải danh sách phiếu khảo sát...</p>
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <ClipboardCheck className="w-8 h-8 text-dlu-primary" />
            </div>
            <h3 className="text-base font-bold text-slate-700">Không có khảo sát nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Hiện tại bạn không có khảo sát nào thuộc nhóm này. Hãy kiểm tra lại sau!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge status={survey.status} />
                    {survey.has_submitted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã hoàn thành
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-dlu-primary bg-dlu-light px-2.5 py-1 rounded-full border border-dlu-primary/20">
                        <HelpCircle className="w-3.5 h-3.5 text-dlu-accent" /> {survey.question_count} câu hỏi
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-dlu-primary transition mb-2">
                    {survey.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {survey.description || 'Không có mô tả chi tiết.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
                    <div className="flex items-center gap-1 font-medium text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-dlu-primary" />
                      <span>{survey.faculty_name || 'Toàn trường DLU'}</span>
                    </div>
                    {survey.end_time && (
                      <div className="flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Hạn: {new Date(survey.end_time).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                  </div>

                  {survey.has_submitted ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đã gửi câu trả lời</span>
                    </button>
                  ) : survey.status === 'CLOSED' ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                    >
                      Khảo sát đã đóng
                    </button>
                  ) : (
                    <Link
                      to={`/survey/${survey.access_token || survey.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-hover transition shadow flex items-center justify-center gap-2 group/btn"
                    >
                      <span>Bắt đầu làm khảo sát</span>
                      <ArrowRight className="w-4 h-4 text-dlu-accent group-hover/btn:translate-x-1 transition" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
