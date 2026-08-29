import React from 'react';

export default function Badge({ status, type = 'status' }) {
  if (type === 'role') {
    const roleConfig = {
      ADMIN: { label: 'Quản trị viên', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
      STAFF: { label: 'Cán bộ khảo sát', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
      STUDENT: { label: 'Sinh viên', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    };
    const c = roleConfig[status] || { label: status, bg: 'bg-slate-100 text-slate-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg}`}>
        {c.label}
      </span>
    );
  }

  const statusConfig = {
    DRAFT: { label: 'Bản nháp', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    PUBLISHED: { label: 'Đang mở', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    CLOSED: { label: 'Đã đóng', bg: 'bg-rose-100 text-rose-800 border-rose-200' }
  };

  const c = statusConfig[status] || { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'PUBLISHED' ? 'bg-emerald-500 animate-pulse' : status === 'CLOSED' ? 'bg-rose-500' : 'bg-slate-400'
      }`}></span>
      {c.label}
    </span>
  );
}
