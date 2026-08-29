import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Home, ClipboardList, Sparkles } from 'lucide-react';

export default function SurveySuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const surveyTitle = location.state?.surveyTitle || 'Khảo sát sinh viên';

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-dlu-primary via-dlu-royal to-dlu-accent"></div>

        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ghi nhận thành công</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
          Cảm ơn bạn đã tham gia khảo sát!
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          Ý kiến phản hồi cho bài khảo sát <strong>"{surveyTitle}"</strong> đã được lưu trữ an toàn vào cơ sở dữ liệu. Đóng góp của bạn giúp xây dựng Trường Đại học Đà Lạt ngày càng phát triển!
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/student/surveys"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-royal transition shadow"
          >
            <ClipboardList className="w-4 h-4 text-dlu-accent" />
            <span>Khảo sát khác</span>
          </Link>

          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
