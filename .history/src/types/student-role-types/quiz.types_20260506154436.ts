import api from '../api';

export interface Quiz {
  id: number;
  title: string;
  durationMinutes: number;
  description: string | null;
  status: string;
  submissions: number;
  averageScore: number;
}

export interface Question {
  id: number;
  text: string;
  points: number;
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface Answer {
  questionId: number;
  selectedAnswer: string;
}

export interface QuizSubmissionResponse {
  Score: string;
  message: string;
}

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