import React from 'react';
import DLULogo from '../../assets/DLULogo';
import { MapPin, Mail, Phone, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B281F] text-slate-300 border-t-4 border-dlu-accent text-sm mt-auto">
      {/* Slogan Banner */}
      <div className="bg-[#081F18] py-3 px-4 border-b border-dlu-primary/40 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider">TRIẾT LÝ GIÁO DỤC TRƯỜNG ĐẠI HỌC ĐÀ LẠT:</span>
          <span className="text-dlu-accent font-serif text-sm font-bold italic tracking-wide">
            "Thụ nhân – Khai phóng – Bản sắc"
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1: Thông tin Trường & Khoa */}
          <div>
            <div className="flex items-center gap-3.5 text-white font-bold text-base mb-3">
              <DLULogo className="w-12 h-12 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-dlu-red uppercase tracking-wider">BỘ GIÁO DỤC VÀ ĐÀO TẠO</div>
                <div className="text-sm font-black text-white uppercase tracking-tight">TRƯỜNG ĐẠI HỌC ĐÀ LẠT</div>
                <div className="text-xs text-dlu-accent font-bold">KHOA CÔNG NGHỆ THÔNG TIN</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              Hệ thống khảo sát trực tuyến mức độ hài lòng của người học về chất lượng đào tạo, điều kiện cơ sở vật chất và dịch vụ hỗ trợ sinh viên.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-dlu-primary/60 border border-dlu-accent/40 text-dlu-accent text-xs rounded-full font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hệ thống Bảo mật & Minh bạch</span>
            </div>
          </div>

          {/* Cột 2: Liên hệ chính thức */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dlu-accent"></span>
              <span>Thông tin liên hệ chính thức</span>
            </h4>
            <ul className="text-xs space-y-2.5 text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-dlu-accent flex-shrink-0 mt-0.5" />
                <span>Số 01 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt, Tỉnh Lâm Đồng</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-dlu-accent flex-shrink-0" />
                <span>Email: <strong className="text-white font-mono">it@dlu.edu.vn</strong> | <strong className="text-white font-mono">khaosat@dlu.edu.vn</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-dlu-accent flex-shrink-0" />
                <span>Điện thoại: (0263) 3822246</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-dlu-accent flex-shrink-0" />
                <span>Website: </span>
                <a href="https://dlu.edu.vn" target="_blank" rel="noreferrer" className="text-dlu-accent hover:underline font-bold flex items-center gap-0.5">
                  dlu.edu.vn <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Đồ án chuyên ngành */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dlu-accent"></span>
              <span>Đồ án Chuyên ngành CNTT</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              Đề tài: <strong>Website khảo sát mức độ hài lòng của sinh viên (DLU)</strong>
            </p>
            <p className="text-xs text-slate-400">
              Khoa Công nghệ Thông tin — Trường Đại học Đà Lạt
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
              © {new Date().getFullYear()} Dalat University. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
