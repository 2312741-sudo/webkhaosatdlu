import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { User, Mail, GraduationCap, Building2, Save, CheckCircle2, Info } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setClassName(user.className || 'CTK47');
      setAcademicYear(user.academicYear || 'K47');
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toastError('Vui lòng nhập đầy đủ Họ và Tên của bạn.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        className: className.trim(),
        academicYear: academicYear.trim()
      });
      success('Cập nhật thông tin sinh viên thành công!');
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hồ sơ Sinh viên DLU" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-dlu-bg border border-slate-200 rounded-2xl flex items-start gap-2.5">
          <Info className="w-4 h-4 text-dlu-green flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 leading-relaxed">
            Thông tin này sẽ hiển thị trên hệ thống khảo sát của Khoa CNTT - Trường Đại học Đà Lạt.
          </p>
        </div>

        {/* Email & Student Code (Readonly) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Email trường DLU
            </label>
            <input
              type="text"
              disabled
              value={user.email}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Mã số sinh viên
            </label>
            <input
              type="text"
              disabled
              value={user.studentCode || 'N/A'}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 font-bold cursor-not-allowed"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Họ và Tên của bạn <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn Hoàng"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-green transition"
            />
          </div>
        </div>

        {/* Class and Academic Year */}
        {user.role === 'STUDENT' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lớp sinh hoạt
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="VD: CTK47"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Khóa đào tạo
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="VD: K47"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-green"
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-dlu-green hover:bg-green-700 text-white text-xs font-bold shadow transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4 text-dlu-accent" />
                <span>Lưu thông tin</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
