import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Flag,
  Play 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuizDetails, useQuizQuestions, useSubmitQuiz } from '../../../../services/student-roleService/quiz.api';
import type { Question } from '../../../../../types/student-role-types/quiz.types';

interface OptionKey {
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface QuizPlayerProps {
  quizId: number;
  onBack: () => void;
  isCompleted: boolean;
}

const QuizPlayer = ({ quizId, onBack, isCompleted }: QuizPlayerProps) => {
  // States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // API Hooks
  const { data: quizDetails } = useQuizDetails(quizId);
  const { data: questions } = useQuizQuestions(quizId);
  const submitMutation = useSubmitQuiz(quizId);

  // Timer logic
  useEffect(() => {
    if (!isQuizStarted || !quizDetails || isSubmitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(); // Auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isQuizStarted, quizDetails, isSubmitted]);

  // Start quiz
  const handleStartQuiz = useCallback(() => {
    if (quizDetails) {
      setTimeLeft(quizDetails.durationMinutes * 60);
      setIsQuizStarted(true);
    }
  }, [quizDetails]);

  // Answer selection
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigation
  const totalQuestions = questions?.length || 0;
  const canGoPrev = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < totalQuestions - 1;

  const goPrev = () => setCurrentQuestionIndex(prev => prev - 1);
  const goNext = () => setCurrentQuestionIndex(prev => prev + 1);

  // Submit all answers
  const handleSubmit = useCallback(async () => {
    if (isSubmitted || submitMutation.isPending) return;

    const answerArray = Object.entries(answers).map(([qId, answer]) => ({
      questionId: Number(qId),
      selectedAnswer: answer as 'A' | 'B' | 'C' | 'D'
    }));

    if (answerArray.length === 0) {
      toast.error('Please answer at least one question');
      return;
    }

    try {
      await submitMutation.mutateAsync({ answers: answerArray });
      setIsSubmitted(true);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit quiz');
    }
  }, [answers, isSubmitted, submitMutation]);

  const currentQuestion = questions?.[currentQuestionIndex];
  const userAnswer = answers[currentQuestion?.id || 0];
  const questionId = currentQuestion?.id || 0;

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-12 shadow-2xl border border-emerald-200 text-center">
        <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Quiz Completed!</h2>
        <p className="text-xl text-slate-600 mb-8">Your answers have been submitted successfully.</p>
        <button 
          onClick={onBack}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg"
        >
          Back to Content
        </button>
      </div>
    );
  }

  if (!quizDetails || !questions) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-3xl shadow-2xl">
      {!isQuizStarted ? (
        // Start Screen
        <div className="p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
            {quizDetails.title}
          </h1>
          <p className="text-xl text-slate-600 mb-2">{quizDetails.durationMinutes} minutes</p>
          {quizDetails.description && (
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">{quizDetails.description}</p>
          )}
          <button
            onClick={handleStartQuiz}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <Play className="w-6 h-6 inline mr-2" />
            Start Quiz Now
          </button>
        </div>
      ) : isSubmitted ? (
        // Results Screen
        <div className="p-12 text-center">
          <Flag className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Quiz Submitted!</h2>
          <p className="text-xl text-slate-600 mb-8">Check your score in your profile.</p>
          <button 
            onClick={onBack}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Back to Content
          </button>
        </div>
      ) : (
        // Quiz Player
        <div className="p-8 h-full flex flex-col">
          {/* Header: Progress + Timer */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse" />
              <span className="font-mono text-sm font-semibold text-slate-700">
                Q {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-200 text-red-700 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl mb-8 max-w-4xl mx-auto max-h-[400px] overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-900 mb-6">{currentQuestion?.text}</h3>
              
              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map((option) => {
                  const optionText = currentQuestion?.[`option${option}` as keyof Question] as string;
                  const isSelected = userAnswer === option;
                  return (
                    <button
                      key={option}
                      disabled={!isQuizStarted || isSubmitted || timeLeft <= 0}
                      onClick={() => handleAnswerSelect(currentQuestion!.id, option)}
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-left
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200/50' 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }
                        ${!isQuizStarted || isSubmitted || timeLeft <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 font-bold flex items-center justify-center text-sm min-w-[32px]">
                        {option}
                      </span>
                      <span className="font-medium text-slate-900">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-6 border-t border-slate-200 bg-white/80 backdrop-blur-sm rounded-b-3xl p-6">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="flex-1 h-14 px-6 rounded-2xl font-semibold text-slate-700 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>
            
            <button
              onClick={canGoNext ? goNext : handleSubmit}
              disabled={timeLeft <= 0 || submitMutation.isPending}
              className={`
                flex-1 h-14 px-6 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                ${canGoNext 
                  ? 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-xl hover:-translate-y-0.5' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                }
                ${timeLeft <= 0 || submitMutation.isPending ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              {canGoNext ? (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;

