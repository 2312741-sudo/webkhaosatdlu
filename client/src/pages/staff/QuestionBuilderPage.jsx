import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { 
  ArrowLeft, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Star, 
  ListOrdered, 
  AlignLeft, 
  HelpCircle,
  Eye,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function QuestionBuilderPage() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal thêm/sửa câu hỏi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'LIKERT_5',
    category: 'Cơ sở vật chất',
    is_required: true,
    options: ['Lựa chọn 1', 'Lựa chọn 2']
  });

  useEffect(() => {
    fetchSurveyAndQuestions();
  }, [surveyId]);

  const fetchSurveyAndQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/surveys/${surveyId}`);
      if (res.data.success) {
        setSurvey(res.data.data);
        setQuestions(res.data.data.questions || []);
      }
    } catch (error) {
      toastError('Không thể tải thông tin khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      question_text: '',
      question_type: 'LIKERT_5',
      category: 'Hoạt động giảng dạy',
      is_required: true,
      options: ['Phương án A', 'Phương án B', 'Phương án C']
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      question_text: q.question_text,
      question_type: q.question_type,
      category: q.category || 'Chung',
      is_required: q.is_required === 1,
      options: q.options && q.options.length > 0 ? q.options.map(o => o.option_text) : ['Lựa chọn 1', 'Lựa chọn 2']
    });
    setIsModalOpen(true);
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...questionForm.options];
    updated[idx] = val;
    setQuestionForm({ ...questionForm, options: updated });
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, `Lựa chọn ${questionForm.options.length + 1}`]
    });
  };

  const removeOption = (idx) => {
    if (questionForm.options.length <= 2) {
      toastError('Câu hỏi trắc nghiệm cần có tối thiểu 2 phương án.');
      return;
    }
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.filter((_, i) => i !== idx)
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.question_text.trim()) {
      toastError('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    try {
      if (editingQuestionId) {
        const res = await api.put(`/surveys/questions/${editingQuestionId}`, questionForm);
        if (res.data.success) {
          success('Cập nhật câu hỏi thành công!');
        }
      } else {
        const res = await api.post(`/surveys/${surveyId}/questions`, questionForm);
        if (res.data.success) {
          success('Thêm câu hỏi mới thành công!');
        }
      }
      setIsModalOpen(false);
      fetchSurveyAndQuestions();
    } catch (err) {
      toastError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu câu hỏi.');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;
    try {
      const res = await api.delete(`/surveys/questions/${qId}`);
      if (res.data.success) {
        success('Đã xóa câu hỏi thành công!');
        fetchSurveyAndQuestions();
      }
    } catch (err) {
      toastError('Không thể xóa câu hỏi.');
    }
  };

  const handlePublishSurvey = async () => {
    if (questions.length === 0) {
      toastError('Khảo sát phải có ít nhất một câu hỏi trước khi phát hành!');
      return;
    }

    try {
      const res = await api.patch(`/surveys/${surveyId}/status`, { status: 'PUBLISHED' });
      if (res.data.success) {
        success('Phát hành khảo sát thành công! Sinh viên đã có thể tham gia làm bài.');
        navigate('/staff/surveys');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Không thể phát hành khảo sát.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <Link
        to="/staff/surveys"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-dlu-primary transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách khảo sát</span>
      </Link>

      {/* Header Banner */}
      {survey && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-dlu-primary via-dlu-royal to-dlu-accent"></div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge status={survey.status} />
              <span className="text-xs font-semibold text-slate-400">
                Mã: <strong className="text-slate-700 font-mono">{survey.access_token}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {survey.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {survey.description || 'Không có mô tả.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-royal shadow-lg transition"
            >
              <PlusCircle className="w-4 h-4 text-dlu-accent" />
              <span>Thêm câu hỏi</span>
            </button>

            {survey.status === 'DRAFT' && (
              <button
                onClick={handlePublishSurvey}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-lg transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Phát hành ngay</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Danh sách câu hỏi ({questions.length})
          </h2>
          <span className="text-xs text-slate-400">
            Hỗ trợ 4 dạng: Likert 1-5, Trắc nghiệm 1 lựa chọn, Nhiều lựa chọn, Tự luận
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chưa có câu hỏi nào trong khảo sát</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Nhấn nút "+ Thêm câu hỏi" để bổ sung câu hỏi đánh giá mức độ hài lòng.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dlu-primary text-white text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4 text-dlu-accent" />
              <span>Thêm câu hỏi đầu tiên</span>
            </button>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="w-7 h-7 rounded-xl bg-dlu-light text-dlu-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Badge type */}
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-dlu-royal border border-blue-100">
                      {q.question_type === 'LIKERT_5' && '⭐ Thang đo Likert (1 - 5)'}
                      {q.question_type === 'SINGLE_CHOICE' && '🔘 Trắc nghiệm 1 lựa chọn'}
                      {q.question_type === 'MULTIPLE_CHOICE' && '☑️ Trắc nghiệm nhiều lựa chọn'}
                      {q.question_type === 'TEXT' && '✍️ Tự luận / Câu hỏi mở'}
                    </span>

                    {q.category && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {q.category}
                      </span>
                    )}

                    {q.is_required ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        Tùy chọn
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-2">
                    {q.question_text}
                  </h3>

                  {/* Preview options */}
                  {['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.question_type) && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                      {q.options.map((opt, oIdx) => (
                        <div key={opt.id || oIdx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                          <span className="w-4 h-4 rounded-full bg-white border border-slate-300 text-[10px] flex items-center justify-center font-bold text-slate-500">
                            {oIdx + 1}
                          </span>
                          <span>{opt.option_text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'LIKERT_5' && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span>1 (Rất không hài lòng)</span>
                      <span>→</span>
                      <span>5 (Rất hài lòng)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end md:self-center">
                <button
                  onClick={() => handleOpenEditModal(q)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                  title="Chỉnh sửa câu hỏi"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                  title="Xóa câu hỏi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit Question */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestionId ? 'Chỉnh sửa Câu hỏi' : 'Thêm Câu hỏi Mới'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nội dung câu hỏi <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              placeholder="VD: Phòng máy thực hành CNTT (A27, A28) có cấu hình đáp ứng tốt nội dung môn học?"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-royal transition font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Dạng câu hỏi
              </label>
              <select
                value={questionForm.question_type}
                onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dlu-royal font-semibold"
              >
                <option value="LIKERT_5">⭐ Thang đo Likert (1 - 5 sao/mức độ)</option>
                <option value="SINGLE_CHOICE">🔘 Trắc nghiệm 1 lựa chọn</option>
                <option value="MULTIPLE_CHOICE">☑️ Trắc nghiệm nhiều lựa chọn</option>
                <option value="TEXT">✍️ Tự luận / Câu hỏi mở</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nhóm tiêu chí / Danh mục
              </label>
              <input
                type="text"
                value={questionForm.category}
                onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                placeholder="VD: Cơ sở vật chất, Giảng viên, Dịch vụ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dlu-royal"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={questionForm.is_required}
                onChange={(e) => setQuestionForm({ ...questionForm, is_required: e.target.checked })}
                className="w-4 h-4 text-dlu-primary rounded"
              />
              <span className="text-xs font-semibold text-slate-700">
                Bắt buộc sinh viên phải trả lời câu hỏi này
              </span>
            </label>
          </div>

          {/* Options for Single & Multi Choice */}
          {['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(questionForm.question_type) && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Các phương án lựa chọn ({questionForm.options.length})
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs font-bold text-dlu-royal hover:underline"
                >
                  + Thêm lựa chọn
                </button>
              </div>

              <div className="space-y-2">
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-bold text-slate-400">{idx + 1}.</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Phương án ${idx + 1}`}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-royal font-medium"
                    />
                    {questionForm.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-royal shadow"
            >
              {editingQuestionId ? 'Cập nhật câu hỏi' : 'Lưu câu hỏi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
