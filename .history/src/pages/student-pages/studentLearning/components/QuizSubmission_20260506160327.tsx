import { useEffect, useState } from 'react';
import { Clock, Play, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getQuizDetails, getQuizQuestions, submitQuizAnswers } from '../../../../services/student-roleService/quizService';
import type { Quiz, Question, Answer } from '../../../../types/student-role-types/quiz.types';

interface QuizSubmissionProps {
  quizId: number;
}

const QuizSubmission = ({ quizId }: QuizSubmissionProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizData, questionsData] = await Promise.all([
          getQuizDetails(quizId),
          getQuizQuestions(quizId),
        ]);
        setQuiz(quizData);
        setQuestions(questionsData);
        setTimeLeft(quizData.durationMinutes * 60);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isSubmitted || isReviewMode) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isSubmitted, isReviewMode]);

  const handleStartQuiz = () => {
    setIsStarted(true);
  };

  const handleAnswerSelect = (questionId: number, selectedAnswer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleBackToQuestions = () => {
    setIsReviewMode(false);
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsReviewMode(false);
  };

  const handleAutoSubmit = async () => {
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    try {
      const answersArray: Answer[] = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId: parseInt(questionId),
        selectedAnswer,
      }));
      const response = await submitQuizAnswers(quizId, answersArray);
      setScore(response.Score);
      setIsSubmitted(true);
      toast.success('Quiz submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      if (err.response?.data?.errorMessages?.error === 'Quiz already submitted') {
        toast.error('Quiz already submitted');
        setIsSubmitted(true);
      } else {
        toast.error('Failed to submit quiz. Please try again.');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="text-center py-8">Loading quiz...</div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="text-center py-8 text-red-600">{error || 'Quiz not found'}</div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="text-center py-8">
          <CheckCircle className="w-11 h-11 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Submitted!</h2>
          {score && <p className="text-[var(--primary-500)]">Your Score: {score}</p>}
          <p className="text-slate-500 mt-4">Thank you for completing the quiz.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{quiz.title}</h2>
          {quiz.description && <p className="text-slate-600 mb-6">{quiz.description}</p>}
          <div className="flex justify-center items-center gap-4 mb-6">
            <Clock className="w-5 h-5 text-slate-500" />
            <span className="text-slate-600">Duration: {quiz.durationMinutes} minutes</span>
          </div>
          <div className="text-slate-500 mb-6">
            Questions: {questions.length} | Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
          </div>
          <button
            onClick={handleStartQuiz}
            className="inline-flex items-center gap-2 bg-[var(--primary-500)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      {/* Header with timer and progress */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-slate-600">
          {isReviewMode ? 'Review Your Answers' : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
        </div>
        {!isReviewMode && (
          <div className={`flex items-center gap-2 ${timeLeft < 300 ? 'text-red-500' : 'text-slate-600'}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
        <div
          className="bg-[var(--primary-500)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${isReviewMode ? 100 : ((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {isReviewMode ? (
        /* Review Mode */
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900">Review Your Answers</h3>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const selectedAnswer = answers[question.id];
              return (
                <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-900">
                      {index + 1}. {question.text}
                    </h4>
                    <button
                      onClick={() => handleGoToQuestion(index)}
                      className="text-[var(--primary-500)] hover:text-[var(--primary-600)] text-sm underline"
                    >
                      Change Answer
                    </button>
                  </div>
                  <div className="text-sm text-slate-600">
                    Your Answer: {selectedAnswer ? `${selectedAnswer}. ${question[`option${selectedAnswer}` as keyof Question]}` : 'Not answered'}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between pt-4 border-t border-slate-200">
            <button
              onClick={handleBackToQuestions}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Questions
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      ) : (
        /* Question Mode */
        <>
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{currentQuestion.text}</h3>
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionText = currentQuestion[`option${option}` as keyof Question] as string;
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[var(--primary-500)] bg-[var(--primary-50)]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                      className="text-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                    />
                    <span className="text-slate-700">{option}. {optionText}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-[var(--primary-500)] text-white px-6 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
            >
              {isLastQuestion ? 'Review Answers' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizSubmission;