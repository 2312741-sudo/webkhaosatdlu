import React from 'react';
import dluLogoImg from './dlu-logo.png';

/**
 * Component Logo Chính thức Trường Đại học Đà Lạt (DLU)
 * Sử dụng file logo gốc chính thống 1024x1024 từ máy chủ dlu.edu.vn
 */
export default function DLULogo({ 
  className = "w-11 h-11 sm:w-12 sm:h-12", 
  imgClassName = "", 
  showText = false, 
  textVariant = "dark" 
}) {
  return (
    <div className="inline-flex items-center gap-3 flex-shrink-0">
      <img
        src={dluLogoImg}
        alt="Trường Đại học Đà Lạt - Dalat University"
        className={`${className} object-contain flex-shrink-0 drop-shadow-sm select-none ${imgClassName}`}
        style={{ aspectRatio: '1 / 1' }}
        loading="eager"
      />

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-700 leading-tight">
            BỘ GIÁO DỤC VÀ ĐÀO TẠO
          </span>
          <span className={`text-sm sm:text-base font-black uppercase tracking-tight leading-tight ${textVariant === 'light' ? 'text-white' : 'text-dlu-primary'}`}>
            TRƯỜNG ĐẠI HỌC ĐÀ LẠT
          </span>
          <span className={`text-xs font-bold leading-tight ${textVariant === 'light' ? 'text-dlu-accent' : 'text-dlu-green'}`}>
            KHOA CÔNG NGHỆ THÔNG TIN
          </span>
        </div>
      )}
    </div>
  );
}
