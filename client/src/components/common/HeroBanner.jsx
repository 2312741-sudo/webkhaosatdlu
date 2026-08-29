import React from 'react';
import DLULogo from '../../assets/DLULogo';
import { Sparkles, GraduationCap, CheckCircle, ShieldCheck } from 'lucide-react';

export default function HeroBanner({ 
  title = "HỆ THỐNG KHẢO SÁT TRỰC TUYẾN MỨC ĐỘ HÀI LÒNG CỦA SINH VIÊN",
  subtitle = "Lắng nghe ý kiến người học để không ngừng nâng cao chất lượng đào tạo, cơ sở vật chất và dịch vụ hỗ trợ sinh viên",
  badge = "KHOA CÔNG NGHỆ THÔNG TIN — TRƯỜNG ĐẠI HỌC ĐÀ LẠT"
}) {
  return (
    <div className="relative bg-gradient-to-r from-dlu-dark via-dlu-primary to-dlu-hover text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b-4 border-dlu-accent shadow-md overflow-hidden">
      {/* Background Subtle Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="max-w-3xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-dlu-accent/40 rounded-full text-xs font-bold text-dlu-accent mb-3 backdrop-blur-sm">
            <GraduationCap className="w-4 h-4 text-dlu-accent" />
            <span>{badge}</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase leading-snug text-white drop-shadow-sm">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed max-w-2xl font-medium">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-xs text-dlu-accent font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-dlu-accent" />
              <span>Khách quan & Minh bạch</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-dlu-accent" />
              <span>Bảo mật thông tin người học</span>
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-dlu-accent" />
              <span>"Thụ nhân – Khai phóng – Bản sắc"</span>
            </span>
          </div>
        </div>

        {/* Right University Crest Emblem */}
        <div className="hidden lg:flex flex-shrink-0 items-center justify-center p-3 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
          <DLULogo className="w-24 h-24 drop-shadow-2xl" />
        </div>
      </div>
    </div>
  );
}
