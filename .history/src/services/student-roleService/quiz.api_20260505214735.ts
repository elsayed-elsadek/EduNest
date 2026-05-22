import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import type { 
  QuizDetails, 
  QuizDetailsResponse, 
  QuizQuestionsResponse, 
  Question, 
  QuizSubmitRequest, 
  QuizSubmitResponse 
} from '../../types/student-role-types/quiz.types';

// Query Keys
export const quizKeys = {
  details: (quizId: number) => ['quiz', 'details', quizId] as const,
  questions: (quizId: number) => ['quiz', 'questions', quizId] as const,
};

// ==================== API FUNCTIONS ====================

/** Fetch quiz details */
export const fetchQuizDetails = async (quizId: number): Promise<QuizDetails> => {
  const { data } = await api.get<QuizDetailsResponse>(`/api/v1/quiz/${quizId}`);
  return data.apiResponse['Quiz Details'];
};

/** Fetch all questions for a quiz */
export const fetchQuizQuestions = async (quizId: number): Promise<Question[]> => {
  const { data } = await api.get<QuizQuestionsResponse>(`/api/v1/question/fetch/${quizId}`);
  return data.apiResponse['Quiz Questions'];
};

/** Submit all answers at once */
export const submitQuizAnswers = async (quizId: number, answers: QuizSubmitRequest): Promise<QuizSubmitResponse> => {
  const { data } = await api.post<QuizSubmitResponse>(`/api/v1/submit-quiz-answer/${quizId}`, answers);
  return data;
};

// ==================== REACT QUERY HOOKS ====================

/** Get quiz details with caching */
export const useQuizDetails = (quizId: number, enabled = true) => {
  return useQuery({
    queryKey: quizKeys.details(quizId),
    queryFn: () => fetchQuizDetails(quizId),
    enabled: enabled && quizId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/** Get quiz questions with caching */
export const useQuizQuestions = (quizId: number, enabled = true) => {
  return useQuery({
    queryKey: quizKeys.questions(quizId),
    queryFn: () => fetchQuizQuestions(quizId),
    enabled: enabled && quizId > 0,
    staleTime: Infinity, // Questions don't change
  });
};

/** Submit quiz answers (mutation) */
export const useSubmitQuiz = (quizId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: QuizSubmitRequest) => submitQuizAnswers(quizId, answers),
    onSuccess: () => {
      // Invalidate quiz data after successful submission
      queryClient.invalidateQueries({ queryKey: quizKeys.details(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
    },
  });
};

