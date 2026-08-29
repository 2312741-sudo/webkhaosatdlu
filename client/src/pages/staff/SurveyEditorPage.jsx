import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Calendar, 
  Users, 
  Sparkles,
  HelpCircle,
  Info
} from 'lucide-react';

export default function SurveyEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    faculty_id: '',
    start_time: '',
    end_time: '',
    is_anonymous: false,
    targets: [{ target_type: 'ALL', target_value: 'ALL' }]
  });

  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaculties();
    if (isEditing) {
      fetchSurveyDetail();
    }
  }, [id]);

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/surveys/faculties');
      if (res.data.success) {
        setFaculties(res.data.data);
      }
    } catch (e) {}
  };

  const fetchSurveyDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/surveys/${id}`);
      if (res.data.success) {
        const s = res.data.data;
        setFormData({
          title: s.title,
          description: s.description || '',
          faculty_id: s.faculty_id || '',
          start_time: s.start_time ? s.start_time.substring(0, 16) : '',
          end_time: s.end_time ? s.end_time.substring(0, 16) : '',
          is_anonymous: s.is_anonymous === 1,
          targets: s.targets && s.targets.length > 0 ? s.targets : [{ target_type: 'ALL', target_value: 'ALL' }]
        });
      }
    } catch (err) {
      toastError('Không thể tải chi tiết khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (index, field, value) => {
    const updated = [...formData.targets];
    updated[index][field] = value;
    if (field === 'target_type' && value === 'ALL') {
      updated[index].target_value = 'ALL';
    }
    setFormData({ ...formData, targets: updated });
  };

  const addTarget = () => {
    setFormData({
      ...formData,
      targets: [...formData.targets, { target_type: 'FACULTY', target_value: 'CNTT' }]
    });
  };

  const removeTarget = (index) => {
    if (formData.targets.length === 1) return;
    setFormData({
      ...formData,
      targets: formData.targets.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toastError('Vui lòng nhập tiêu đề khảo sát.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const res = await api.put(`/surveys/${id}`, formData);
        if (res.data.success) {
          success('Cập nhật thông tin khảo sát thành công!');
          navigate('/staff/surveys');
        }
      } else {
        const res = await api.post('/surveys', formData);
        if (res.data.success) {
          success('Tạo khảo sát thành công! Hãy tiếp tục thêm các câu hỏi.');
          navigate(`/staff/surveys/${res.data.data.id}/questions`);
        }
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <Link
        to="/staff/surveys"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-dlu-primary transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách khảo sát</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-dlu-primary via-dlu-royal to-dlu-accent"></div>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {isEditing ? 'Chỉnh sửa Thông tin Khảo sát' : 'Tạo Đợt Khảo sát Mới'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Điền các thông số cơ bản, thời gian mở/đóng và phạm vi đối tượng sinh viên áp dụng.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tiêu đề phiếu khảo sát <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Khảo sát mức độ hài lòng về chất lượng đào tạo HK1 (2025 - 2026)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-royal transition font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mô tả / Hướng dẫn sinh viên
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả mục đích của đợt khảo sát, hướng dẫn sinh viên cách đánh giá..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-royal transition leading-relaxed"
            />
          </div>

          {/* Faculty and Anonymous Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Khoa / Phòng ban tổ chức
              </label>
              <select
                value={formData.faculty_id}
                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value ? Number(e.target.value) : '' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dlu-royal font-medium"
              >
                <option value="">Toàn trường (Không giới hạn Khoa)</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tính năng ẩn danh
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  className="w-4 h-4 text-dlu-primary rounded focus:ring-dlu-royal"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Ẩn danh sinh viên (Không lưu mã SV khi xuất báo cáo)
                </span>
              </label>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Thời gian mở khảo sát
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dlu-royal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Thời gian kết thúc (Đóng khảo sát)
              </label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dlu-royal"
              />
            </div>
          </div>

          {/* Survey Target Audiences (Đối tượng áp dụng) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Đối tượng áp dụng khảo sát
                </h3>
                <p className="text-[11px] text-slate-400">
                  Hệ thống sẽ lọc danh sách hiển thị cho sinh viên đúng Khoa, Lớp hoặc Khóa.
                </p>
              </div>

              <button
                type="button"
                onClick={addTarget}
                className="text-xs font-bold text-dlu-primary hover:text-dlu-royal bg-dlu-light px-3 py-1.5 rounded-lg transition"
              >
                + Thêm phạm vi
              </button>
            </div>

            <div className="space-y-3">
              {formData.targets.map((t, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <select
                    value={t.target_type}
                    onChange={(e) => handleTargetChange(idx, 'target_type', e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 font-semibold text-slate-700"
                  >
                    <option value="ALL">Tất cả sinh viên (ALL)</option>
                    <option value="FACULTY">Theo Khoa</option>
                    <option value="CLASS">Theo Lớp (vd: CTK45)</option>
                    <option value="ACADEMIC_YEAR">Theo Khóa (vd: K45)</option>
                  </select>

                  {t.target_type !== 'ALL' && (
                    <input
                      type="text"
                      value={t.target_value}
                      onChange={(e) => handleTargetChange(idx, 'target_value', e.target.value)}
                      placeholder={
                        t.target_type === 'FACULTY' ? 'Mã khoa (vd: CNTT)' :
                        t.target_type === 'CLASS' ? 'Mã lớp (vd: CTK45)' : 'Khóa (vd: K45)'
                      }
                      className="flex-1 bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-dlu-royal font-medium"
                    />
                  )}

                  {formData.targets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTarget(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/staff/surveys"
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-royal shadow-lg hover:shadow-xl transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4 text-dlu-accent" />
                  <span>{isEditing ? 'Lưu thay đổi' : 'Tạo và tiếp tục thêm câu hỏi'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
