
import api from '../api';
import type {
  Quiz,
  Question,
  Answer,
  QuizSubmissionResponse,
  MyAnswersResponse,
} from '../../types/student-role-types/quiz.types';
import axios from 'axios';

export const getQuizDetails = async (id: number): Promise<Quiz> => {
  const response = await api.get(`/api/v1/quiz/${id}`);
  return response.data.apiResponse['Quiz Details'];
};

export const getQuizQuestions = async (quizId: number): Promise<Question[]> => {
  const response = await api.get(`/api/v1/question/student/fetch/${quizId}`);
  return response.data.apiResponse['Quiz Questions'];
};

export const submitQuizAnswers = async (
  quizId: number,
  answers: Answer[]
): Promise<QuizSubmissionResponse> => {
  const response = await api.post(`/api/v1/submit-quiz-answer/${quizId}`, { answers });
  return response.data.apiResponse;
};

export const getMyAnswers = async (quizId: number): Promise<MyAnswersResponse | null> => {
  try {
    const response = await api.get(`/api/v1/my-answers/${quizId}`);
    return response.data.apiResponse ?? null;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 400 || status === 404) return null;
    }
    throw err;
  }
};