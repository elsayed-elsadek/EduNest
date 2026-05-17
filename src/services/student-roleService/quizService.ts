import api from '../api';
import type { Quiz, Question, Answer, QuizSubmissionResponse, StudentQuizScore } from '../../types/student-role-types/quiz.types';
import axios from 'axios';

export const getQuizDetails = async (id: number): Promise<Quiz> => {
  const response = await api.get(`/api/v1/quiz/${id}`);
  return response.data.apiResponse['Quiz Details'];
};

export const getQuizQuestions = async (quizId: number): Promise<Question[]> => {
  const response = await api.get(`/api/v1/question/fetch/${quizId}`);
  return response.data.apiResponse['Quiz Questions'];
};

export const submitQuizAnswers = async (
  quizId: number,
  answers: Answer[]
): Promise<QuizSubmissionResponse> => {
  const response = await api.post(`/api/v1/submit-quiz-answer/${quizId}`, {
    answers,
  });
  return response.data.apiResponse;
};

export const getStudentQuizScore = async (
  quizId: number
): Promise<StudentQuizScore | null> => {
  try {
    const response = await api.get(`/api/v1/quiz/${quizId}`);
    return response.data.apiResponse?.studentScore || null;
  } catch (err: unknown) {
    // If 404 or not found, student hasn't submitted yet
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }

    throw err;
  }
};