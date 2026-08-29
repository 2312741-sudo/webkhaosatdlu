import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import LikertBarChart from '../../components/charts/LikertBarChart';
import OptionPieChart from '../../components/charts/OptionPieChart';
import Badge from '../../components/common/Badge';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Clock, 
  Star, 
  Filter, 
  Building2, 
  Calendar,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Download
} from 'lucide-react';

export default function SurveyAnalyticsPage() {
  const { surveyId } = useParams();
  const { success, error: toastError } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    class_name: '',
    academic_year: '',
    date_from: '',
    date_to: ''
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [surveyId, filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = `/analytics/${surveyId}`;
      const params = new URLSearchParams();
      if (filters.class_name) params.append('class_name', filters.class_name);
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      toastError('Không thể tải dữ liệu thống kê khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/reports/${surveyId}/excel`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_cao_khao_sat_${surveyId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Xuất file Excel thành công!');
    } catch (error) {
      toastError('Không thể xuất báo cáo Excel.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/reports/${surveyId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_cao_khao_sat_${surveyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Xuất file PDF thành công!');
    } catch (error) {
      toastError('Không thể xuất báo cáo PDF.');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3 font-semibold">Đang tổng hợp dữ liệu thống kê...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl text-center border">
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy dữ liệu</h3>
      </div>
    );
  }

  const { survey, summary, category_breakdown, questions, available_classes, class_distribution } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        to="/staff/surveys"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-dlu-primary transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách</span>
      </Link>

      {/* Top Banner with Title & Export Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-dlu-primary via-dlu-royal to-dlu-accent"></div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge status={survey.status} />
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {survey.faculty_name || 'Toàn trường DLU'}
            </span>
            <span className="text-xs text-slate-400">
              Người tạo: <strong>{survey.creator_name}</strong>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            Thống kê & Trực quan hóa: {survey.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp kết quả phản hồi của sinh viên theo các dạng biểu đồ và bộ lọc linh hoạt.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow transition disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-rose-300" />
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Responses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-dlu-royal flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng lượt phản hồi</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              {summary.total_responses} <span className="text-sm font-semibold text-slate-400">sinh viên</span>
            </div>
          </div>
        </div>

        {/* Card 2: Overall Satisfaction Score */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Star className="w-7 h-7 fill-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm hài lòng trung bình</div>
            <div className="text-2xl sm:text-3xl font-black text-dlu-primary mt-0.5 flex items-baseline gap-1">
              {summary.overall_satisfaction_score} <span className="text-sm font-semibold text-slate-400">/ 5.0 ⭐</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Time */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian làm bài TB</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              {summary.avg_completion_time_minutes} <span className="text-sm font-semibold text-slate-400">phút</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-dlu-royal" />
          <span>Bộ lọc thống kê:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <select
            value={filters.class_name}
            onChange={(e) => setFilters({ ...filters, class_name: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-dlu-royal font-medium"
          >
            <option value="">Tất cả các Lớp</option>
            {available_classes?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Academic Year */}
          <input
            type="text"
            placeholder="Khóa (vd: K45)"
            value={filters.academic_year}
            onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 w-32 focus:outline-none focus:ring-2 focus:ring-dlu-royal font-medium"
          />

          {(filters.class_name || filters.academic_year || filters.date_from || filters.date_to) && (
            <button
              onClick={() => setFilters({ class_name: '', academic_year: '', date_from: '', date_to: '' })}
              className="text-xs font-bold text-rose-600 hover:underline px-2"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Category Breakdown Progress */}
      {category_breakdown && category_breakdown.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-dlu-royal" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Điểm Đánh giá theo Nhóm Tiêu chí
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category_breakdown.map((cat, idx) => {
              const score = cat.average_score;
              const pct = (score / 5) * 100;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                    <span>{cat.category}</span>
                    <span className="text-dlu-primary font-black text-sm">{score} / 5.0 ⭐</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-dlu-royal to-dlu-accent h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Questions Analytics Charts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Biểu đồ Thống kê Chi tiết từng Câu hỏi ({questions.length})
          </h2>
        </div>

        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="w-7 h-7 rounded-xl bg-dlu-light text-dlu-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-dlu-royal border border-blue-100">
                    {q.question_type === 'LIKERT_5' && 'Thang đo Likert 1-5'}
                    {q.question_type === 'SINGLE_CHOICE' && 'Trắc nghiệm 1 lựa chọn'}
                    {q.question_type === 'MULTIPLE_CHOICE' && 'Trắc nghiệm nhiều lựa chọn'}
                    {q.question_type === 'TEXT' && 'Ý kiến tự luận'}
                  </span>
                  {q.category && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {q.category}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {q.total_answers} lượt trả lời
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {q.question_text}
                </h3>
              </div>
            </div>

            {/* Render appropriate chart according to Question Type */}
            <div className="pt-2">
              {q.question_type === 'LIKERT_5' && (
                <LikertBarChart stats={q.stats} questionText={q.question_text} />
              )}

              {['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.question_type) && q.stats && (
                <OptionPieChart options={q.stats.options} />
              )}

              {q.question_type === 'TEXT' && q.stats && (
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {q.stats.text_responses && q.stats.text_responses.length > 0 ? (
                    q.stats.text_responses.map((ans, aIdx) => (
                      <div key={aIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="text-slate-800 font-medium leading-relaxed mb-1">
                          "{ans.text_answer}"
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          {ans.class_name && <span>Lớp: {ans.class_name}</span>}
                          {ans.submitted_at && <span>Gửi lúc: {ans.submitted_at}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic py-3">Chưa có câu trả lời tự luận nào.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
