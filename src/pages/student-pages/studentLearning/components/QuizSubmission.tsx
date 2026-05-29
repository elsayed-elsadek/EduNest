
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Clock, Play, ChevronRight, ChevronLeft,
  CheckCircle, AlertTriangle, Eye, Trophy, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getQuizDetails,
  getQuizQuestions,
  submitQuizAnswers,
  getMyAnswers,
} from '../../../../services/student-roleService/quizService';
import type {
  Quiz, Question, Answer, ReviewAnswerItem,
} from '../../../../types/student-role-types/quiz.types';
import axios from 'axios';
import { getBackendErrorMessage } from '../../../../services/student-roleService/apiResponseHelpers';

interface QuizSubmissionProps {
  quizId: number;
}

type Stage =
  | 'loading'
  | 'error'
  | 'already-done'
  | 'intro'
  | 'quiz'
  | 'review'
  | 'submitted'
  | 'view-answers';

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background: 'linear-gradient(90deg, var(--primary-400), var(--primary-600))',
        }}
      />
    </div>
  );
}

function TimerBadge({ seconds }: { seconds: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-semibold transition-colors ${
        seconds < 120 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      {formatTime(seconds)}
    </span>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[420px] flex flex-col">
      {children}
    </div>
  );
}

function ScoreBadge({
  score, total, color = 'green',
}: { score: number; total: number; color?: 'green' | 'primary' }) {
  const colorMap = {
    green: 'from-green-50 to-emerald-50 border-green-100 text-green-600',
    primary: 'from-[var(--primary-50)] to-blue-50 border-[var(--primary-100)] text-[var(--primary-600)]',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-6 w-full max-w-xs border`}>
      <p className="text-slate-500 text-sm mb-1">Your Score</p>
      <p className="text-5xl font-extrabold">
        {score}
        <span className="text-2xl font-semibold text-slate-400"> / {total}</span>
      </p>
    </div>
  );
}

const QuizSubmission = ({ quizId }: QuizSubmissionProps) => {
  const [stage, setStage] = useState<Stage>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [submittedScore, setSubmittedScore] = useState(0);
  const [submittedTotal, setSubmittedTotal] = useState(0);

  const [alreadyScore, setAlreadyScore] = useState(0);
  const [alreadyTotal, setAlreadyTotal] = useState(0);

  const [reviewList, setReviewList] = useState<ReviewAnswerItem[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [viewAnswersOrigin, setViewAnswersOrigin] = useState<'already-done' | 'submitted'>('submitted');

  const submittingRef = useRef(false);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const payload: Answer[] = Object.entries(answers).map(([qId, sel]) => ({
      questionId: parseInt(qId),
      selectedAnswer: sel,
    }));

    // لو auto-submit ومفيش إجابات خالص → score = 0 من غير request
    if (isAutoSubmit && payload.length === 0) {
      setSubmittedScore(0);
      setSubmittedTotal(quiz?.totalPoints ?? 0);
      toast('Time is up! Quiz auto-submitted with score 0.', { icon: '⏰' });
      setStage('submitted');
      return;
    }

    try {
      const res = await submitQuizAnswers(quizId, payload);
      const details = res['Student details'];
      setSubmittedScore(details?.score ?? 0);
      setSubmittedTotal(details?.totalPoints ?? 0);
      toast.success(
        isAutoSubmit
          ? 'Time is up! Quiz submitted automatically.'
          : (res.message ?? 'Quiz submitted!')
      );
      setStage('submitted');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.errorMessages?.error;
        if ((status === 400 || status === 409) && msg === 'Quiz already submitted') {
          toast.error('This quiz was already submitted.');
          setStage('already-done');
          return;
        }
      }
      toast.error(getBackendErrorMessage(err, 'Submission failed.'));
      submittingRef.current = false;
    }
  }, [answers, quiz, quizId]);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [quizData, questionsData] = await Promise.all([
          getQuizDetails(quizId),
          getQuizQuestions(quizId),
        ]);
        setQuiz(quizData);
        setQuestions(questionsData);
        setTimeLeft(quizData.durationMinutes * 60);

        if (quizData.submissions > 0) {
          setAlreadyScore(quizData.averageScore);
          // totalPoints بييجي من الـ API مش من حساب الـ questions
          setAlreadyTotal(quizData.totalPoints);
          setStage('already-done');
          return;
        }
        setStage('intro');
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load quiz. Please try again.');
        setStage('error');
      }
    })();
  }, [quizId]);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'quiz') return;
    if (timeLeft <= 0) { doSubmit(true); return; }
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { doSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage, timeLeft, doSubmit]);

  // ── View Answers ────────────────────────────────────────────────────────────
  const handleViewAnswers = async (origin: 'already-done' | 'submitted') => {
    setViewAnswersOrigin(origin);
    setLoadingAnswers(true);
    setStage('view-answers');
    try {
      const res = await getMyAnswers(quizId);
      setReviewList(res?.Review ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load answers.');
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleAnswerSelect = (qId: number, option: string) =>
    setAnswers(prev => ({ ...prev, [qId]: option }));

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
    else setStage('review');
  };

  const handlePrev = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1); };

  const answeredCount = Object.keys(answers).length;
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (stage === 'loading') return (
    <Wrapper>
      <div className="flex flex-col items-center gap-4 py-20 text-slate-400">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[var(--primary-500)] animate-spin" />
        <p className="text-sm">Loading quiz…</p>
      </div>
    </Wrapper>
  );

  // ── ERROR ─────────────────────────────────────────────────────────────────────
  if (stage === 'error') return (
    <Wrapper>
      <div className="flex flex-col items-center gap-3 py-20 text-red-500">
        <AlertTriangle className="w-12 h-12" />
        <p className="font-medium">{errorMsg}</p>
      </div>
    </Wrapper>
  );

  // ── ALREADY SUBMITTED ─────────────────────────────────────────────────────────
  if (stage === 'already-done') return (
    <Wrapper>
      <div className="flex flex-col items-center text-center py-8 gap-5">
        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center ring-4 ring-amber-100">
          <Trophy className="w-9 h-9 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Already Completed</h2>
          <p className="text-slate-500 text-sm">You have already submitted this quiz.</p>
        </div>
        <ScoreBadge score={alreadyScore} total={alreadyTotal} color="primary" />
        <button
          onClick={() => handleViewAnswers('already-done')}
          className="inline-flex items-center gap-2 border border-[var(--primary-200)] text-[var(--primary-600)] font-medium px-6 py-2.5 rounded-xl text-sm"
          style={{ backgroundColor: 'white', color: 'var(--primary-600)' }}
        >
          <Eye className="w-4 h-4" /> View My Answers
        </button>
        <p className="text-xs text-slate-400">Contact your mentor if you have questions.</p>
      </div>
    </Wrapper>
  );

  if (!quiz) return null;

  // ── INTRO ─────────────────────────────────────────────────────────────────────
  if (stage === 'intro') return (
    <Wrapper>
      <div className="flex flex-col items-center text-center py-8 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary-50)] flex items-center justify-center ring-2 ring-[var(--primary-100)]">
          <Play className="w-7 h-7 text-[var(--primary-600)] ml-0.5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-slate-500 text-sm max-w-md">{quiz.description}</p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {[
            { label: 'Duration', value: `${quiz.durationMinutes} min` },
            { label: 'Questions', value: questions.length },
            { label: 'Total Points', value: totalPoints },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left text-sm w-full max-w-sm">
          <p className="font-semibold text-amber-800 mb-1">⚠️ Before you start</p>
          <ul className="space-y-1 text-amber-700 list-disc list-inside">
            <li>Timer starts immediately when you click Start</li>
            <li>Quiz auto-submits when time runs out</li>
            <li>You cannot retake once submitted</li>
          </ul>
        </div>
        <button
          onClick={() => setStage('quiz')}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold"
          style={{ backgroundColor: 'var(--primary-500)', color: 'white' }}
        >
          <Play className="w-4 h-4" /> Start Quiz
        </button>
      </div>
    </Wrapper>
  );

  const currentQuestion = questions[currentIdx];

  // ── QUIZ ──────────────────────────────────────────────────────────────────────
  if (stage === 'quiz') return (
    <Wrapper>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">
          Question <span className="text-slate-900 font-semibold">{currentIdx + 1}</span> / {questions.length}
        </span>
        <TimerBadge seconds={timeLeft} />
      </div>

      <ProgressBar value={((currentIdx + 1) / questions.length) * 100} />

      <div className="mt-6 mb-5">
        <div className="flex items-start gap-3 mb-5">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--primary-500)] text-white text-xs font-bold flex items-center justify-center mt-0.5">
            {currentIdx + 1}
          </span>
          <h3 className="text-base font-semibold text-slate-900 leading-snug">
            {currentQuestion?.text}
          </h3>
        </div>
        <div className="space-y-2.5">
          {(['A', 'B', 'C', 'D'] as const).map((opt) => {
            const text = currentQuestion?.[`option${opt}` as keyof Question] as string;
            if (!text) return null;
            const selected = answers[currentQuestion.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleAnswerSelect(currentQuestion.id, opt)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? 'border-[var(--primary-500)] bg-[var(--primary-50)]'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  selected
                    ? 'bg-[var(--primary-500)] border-[var(--primary-500)] text-white'
                    : 'border-slate-200 text-slate-400'
                }`}>
                  {opt}
                </span>
                <span className={`text-sm leading-snug ${selected ? 'text-[var(--primary-700)]' : 'text-slate-700'}`}>
                  {text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-5 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--primary-500)', color: 'white' }}
        >
          {currentIdx === questions.length - 1 ? 'Review Answers' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </Wrapper>
  );

  // ── REVIEW ────────────────────────────────────────────────────────────────────
  if (stage === 'review') return (
    <Wrapper>
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">Review Your Answers</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          {answeredCount} of {questions.length} answered
          {answeredCount < questions.length && (
            <span className="ml-1 text-amber-600 font-medium">
              ({questions.length - answeredCount} unanswered)
            </span>
          )}
        </p>
      </div>

      <ProgressBar value={100} />

      <div className="mt-5 space-y-3 max-h-[52vh] overflow-y-auto pr-1">
        {questions.map((q, i) => {
          const sel = answers[q.id];
          const optText = sel ? (q[`option${sel}` as keyof Question] as string) : null;
          return (
            <div key={q.id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-slate-800">
                  <span className="text-slate-400 mr-1.5">{i + 1}.</span>
                  {q.text}
                </p>
                <button
                  onClick={() => { setCurrentIdx(i); setStage('quiz'); }}
                  className="flex-shrink-0 text-xs text-[var(--primary-500)] hover:text-[var(--primary-700)] font-medium hover:underline underline-offset-2 transition-colors"
                >
                  Edit
                </button>
              </div>
              {sel ? (
                <span className="inline-flex items-center gap-1.5 text-xs bg-[var(--primary-50)] text-[var(--primary-700)] px-2.5 py-1 rounded-full font-medium">
                  <CheckCircle className="w-3 h-3" />
                  {sel}. {optText}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                  <AlertTriangle className="w-3 h-3" /> Not answered
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 mt-auto border-t border-slate-100">
        <button
          onClick={() => { setCurrentIdx(questions.length - 1); setStage('quiz'); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => doSubmit(false)}
          className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-lg"
          style={{ backgroundColor: '#16a34a', color: 'white' }}
        >
          <CheckCircle className="w-4 h-4" /> Submit Quiz
        </button>
      </div>
    </Wrapper>
  );

  // ── SUBMITTED ─────────────────────────────────────────────────────────────────
  if (stage === 'submitted') return (
    <Wrapper>
      <div className="flex flex-col items-center text-center py-8 gap-5">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center ring-4 ring-green-100">
          <CheckCircle className="w-9 h-9 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Quiz Submitted!</h2>
          <p className="text-slate-500 text-sm">Great job completing the quiz.</p>
        </div>
        <ScoreBadge score={submittedScore} total={submittedTotal} color="green" />
        <button
          onClick={() => handleViewAnswers('submitted')}
          className="inline-flex items-center gap-2 border border-[var(--primary-200)] text-[var(--primary-600)] font-medium px-6 py-2.5 rounded-xl text-sm"
          style={{ backgroundColor: 'white', color: 'var(--primary-600)' }}
        >
          <Eye className="w-4 h-4" /> View My Answers
        </button>
      </div>
    </Wrapper>
  );

  // ── VIEW ANSWERS ──────────────────────────────────────────────────────────────
  if (stage === 'view-answers') {
    const mergedList = questions.map(q => {
      const apiAnswer = reviewList.find(r => r.questionId === q.id);
      return apiAnswer ?? {
        questionId: q.id,
        text: q.text,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: '',
        selectedAnswer: '',
      };
    });

    return (
      <Wrapper>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">My Answers</h3>
          <button
            onClick={() => setStage(viewAnswersOrigin)}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Back
          </button>
        </div>

        {loadingAnswers ? (
          <div className="flex flex-col items-center gap-4 py-12 text-slate-400">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[var(--primary-500)] animate-spin" />
            <p className="text-sm">Loading your answers…</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {mergedList.map((a, i) => {
              const isAnswered = !!a.selectedAnswer;
              const isCorrect = isAnswered && a.selectedAnswer === a.correctAnswer;

              return (
                <div
                  key={a.questionId}
                  className={`rounded-xl p-4 border-2 ${
                    !isAnswered
                      ? 'border-slate-200 bg-slate-50/40'
                      : isCorrect
                      ? 'border-green-200 bg-green-50/40'
                      : 'border-red-200 bg-red-50/40'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    {!isAnswered ? (
                      <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    ) : isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-semibold text-slate-800">
                      <span className="text-slate-400 mr-1.5">{i + 1}.</span>
                      {a.text}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pl-6">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const optText = a[`option${opt}` as keyof typeof a] as string;
                      if (!optText) return null;

                      const isSelected = a.selectedAnswer === opt;
                      const isCorrectOpt = isAnswered && a.correctAnswer === opt;

                      let optStyle = 'border-slate-200 bg-white text-slate-600';
                      let circleStyle = 'border-slate-300 text-slate-400';

                      if (isAnswered) {
                        if (isCorrectOpt) {
                          optStyle = 'border-green-400 bg-green-50 text-green-800';
                          circleStyle = 'border-green-500 bg-green-500 text-white';
                        } else if (isSelected && !isCorrectOpt) {
                          optStyle = 'border-red-400 bg-red-50 text-red-800';
                          circleStyle = 'border-red-500 bg-red-500 text-white';
                        }
                      }

                      return (
                        <div
                          key={opt}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all ${optStyle}`}
                        >
                          <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 ${circleStyle}`}>
                            {opt}
                          </span>
                          <span className="text-sm leading-snug flex-1">{optText}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isSelected && !isCorrectOpt && (
                              <span className="text-xs text-red-500 font-medium">Your answer</span>
                            )}
                            {isCorrectOpt && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle className="w-3 h-3" /> Correct
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {!isAnswered && (
                      <p className="text-xs text-slate-400 mt-1">You did not answer this question.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Wrapper>
    );
  }

  return null;
};

export default QuizSubmission;