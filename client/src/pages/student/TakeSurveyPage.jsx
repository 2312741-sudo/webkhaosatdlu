import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Clock, 
  Building2, 
  Sparkles, 
  Star, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function TakeSurveyPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    fetchSurvey();
  }, [identifier]);

  const fetchSurvey = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/responses/take/${identifier}`);
      if (res.data.success) {
        setSurveyData(res.data.data);
        // Khởi tạo form answers
        const initial = {};
        res.data.data.questions.forEach((q) => {
          if (q.question_type === 'MULTIPLE_CHOICE') {
            initial[q.id] = [];
          } else {
            initial[q.id] = '';
          }
        });
        setAnswers(initial);
      }
    } catch (error) {
      toastError(error.response?.data?.message || 'Không thể tải thông tin khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikertSelect = (questionId, rating) => {
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleSingleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleMultiSelect = (questionId, optionId) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleTextChange = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  // Tính % tiến độ hoàn thành
  const calculateProgress = () => {
    if (!surveyData?.questions) return 0;
    const requiredQuestions = surveyData.questions.filter((q) => q.is_required);
    if (requiredQuestions.length === 0) return 100;

    let completed = 0;
    requiredQuestions.forEach((q) => {
      const val = answers[q.id];
      if (q.question_type === 'MULTIPLE_CHOICE' && Array.isArray(val) && val.length > 0) completed++;
      else if (val !== '' && val !== null && val !== undefined) completed++;
    });

    return Math.round((completed / requiredQuestions.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!surveyData?.survey) return;

    // Validate required questions
    for (const q of surveyData.questions) {
      if (q.is_required) {
        const val = answers[q.id];
        if (
          val === '' ||
          val === null ||
          val === undefined ||
          (q.question_type === 'MULTIPLE_CHOICE' && Array.isArray(val) && val.length === 0)
        ) {
          toastError(`Vui lòng trả lời câu hỏi bắt buộc: "${q.question_text}"`);
          const elem = document.getElementById(`question-card-${q.id}`);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            elem.classList.add('ring-2', 'ring-rose-500');
            setTimeout(() => elem.classList.remove('ring-2', 'ring-rose-500'), 2500);
          }
          return;
        }
      }
    }

    const completionSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Format payload
    const formattedAnswers = surveyData.questions.map((q) => {
      const val = answers[q.id];
      const item = { question_id: q.id };

      if (q.question_type === 'LIKERT_5') {
        item.rating_value = Number(val) || null;
      } else if (q.question_type === 'SINGLE_CHOICE') {
        item.selected_option_id = Number(val) || null;
      } else if (q.question_type === 'MULTIPLE_CHOICE') {
        item.selected_option_ids = Array.isArray(val) ? val.map(Number) : [];
      } else if (q.question_type === 'TEXT') {
        item.text_answer = val ? String(val).trim() : '';
      }
      return item;
    });

    setSubmitting(true);
    try {
      const res = await api.post(`/responses/take/${surveyData.survey.id}/submit`, {
        completion_time_seconds: completionSeconds,
        answers: formattedAnswers
      });

      if (res.data.success) {
        success(res.data.message);
        navigate('/survey-success', { state: { surveyTitle: surveyData.survey.title } });
      }
    } catch (error) {
      toastError(error.response?.data?.message || 'Có lỗi xảy ra khi nộp bài khảo sát.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3 font-semibold">Đang chuẩn bị phiếu khảo sát...</p>
      </div>
    );
  }

  if (!surveyData || !surveyData.survey) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl text-center border border-slate-100 shadow">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy khảo sát</h2>
        <p className="text-xs text-slate-500 mt-1">Đường dẫn khảo sát không hợp lệ hoặc đã bị gỡ bỏ.</p>
      </div>
    );
  }

  const { survey, questions, hasSubmitted } = surveyData;
  const progress = calculateProgress();

  if (hasSubmitted) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl text-center border border-emerald-100 shadow-lg">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Bạn đã hoàn thành khảo sát này!</h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Hệ thống ghi nhận bạn đã nộp câu trả lời cho phiếu <strong>"{survey.title}"</strong>. Mỗi sinh viên chỉ được tham gia khảo sát một lần để đảm bảo tính khách quan.
        </p>
        <button
          onClick={() => navigate('/student/surveys')}
          className="px-6 py-2.5 rounded-xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-royal transition shadow"
        >
          Quay lại danh sách khảo sát
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Sticky Progress Bar at Top */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2 truncate">
            <span className="text-dlu-primary truncate">{survey.title}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-24 sm:w-36 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-dlu-royal to-dlu-accent h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-dlu-primary font-black">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* Survey Banner Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-dlu-primary via-dlu-royal to-dlu-accent"></div>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-dlu-royal uppercase tracking-wide mb-2">
            <Building2 className="w-4 h-4" />
            <span>{survey.faculty_name || 'Trường Đại học Đà Lạt'}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mb-3">
            {survey.title}
          </h1>

          {survey.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
              {survey.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Khảo sát chính thức DLU</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Thời gian ước tính: 2 – 3 phút</span>
            </div>
          </div>
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm transition-all duration-200"
            >
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-xl bg-dlu-light text-dlu-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question_text}
                    {q.is_required ? (
                      <span className="text-rose-500 ml-1" title="Bắt buộc">*</span>
                    ) : (
                      <span className="text-slate-400 text-xs font-normal ml-1">(Tùy chọn)</span>
                    )}
                  </h3>
                  {q.category && (
                    <span className="inline-block text-[11px] font-medium text-slate-400 mt-1">
                      Tiêu chí: {q.category}
                    </span>
                  )}
                </div>
              </div>

              {/* 1. LIKERT SCALE 1-5 */}
              {q.question_type === 'LIKERT_5' && (
                <div className="mt-4">
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[
                      { val: 1, label: 'Rất không hài lòng', emoji: '😡' },
                      { val: 2, label: 'Không hài lòng', emoji: '🙁' },
                      { val: 3, label: 'Bình thường', emoji: '😐' },
                      { val: 4, label: 'Hài lòng', emoji: '🙂' },
                      { val: 5, label: 'Rất hài lòng', emoji: '😍' }
                    ].map((item) => {
                      const isSelected = answers[q.id] === item.val;
                      return (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleLikertSelect(q.id, item.val)}
                          className={`p-3 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-dlu-primary text-white border-dlu-primary shadow-md scale-105 ring-2 ring-dlu-accent'
                              : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xl sm:text-2xl">{item.emoji}</span>
                          <span className="text-xs sm:text-sm font-black">{item.val}</span>
                          <span className="text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. SINGLE CHOICE */}
              {q.question_type === 'SINGLE_CHOICE' && (
                <div className="space-y-2 mt-4">
                  {q.options?.map((opt) => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSingleSelect(q.id, opt.id)}
                        className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-dlu-royal text-dlu-primary font-bold shadow-sm'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-dlu-primary focus:ring-dlu-royal cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm">{opt.option_text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 3. MULTIPLE CHOICE */}
              {q.question_type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2 mt-4">
                  {q.options?.map((opt) => {
                    const isChecked = Array.isArray(answers[q.id]) && answers[q.id].includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleMultiSelect(q.id, opt.id)}
                        className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-50/70 border-dlu-royal text-dlu-primary font-bold shadow-sm'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-dlu-primary rounded focus:ring-dlu-royal cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm">{opt.option_text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 4. TEXT */}
              {q.question_type === 'TEXT' && (
                <div className="mt-4">
                  <textarea
                    rows={3}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder="Nhập ý kiến đóng góp, góp ý của bạn tại đây..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-royal focus:border-transparent transition"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Bottom Submit Sticky Bar */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-dlu-primary text-white text-sm sm:text-base font-bold hover:bg-dlu-royal shadow-xl hover:shadow-2xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5 text-dlu-accent" />
                  <span>Gửi phiếu khảo sát</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Bằng việc nhấn Gửi, câu trả lời của bạn sẽ được chuyển đến Cán bộ khảo sát DLU.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
