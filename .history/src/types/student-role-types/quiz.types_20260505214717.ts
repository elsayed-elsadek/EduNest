// Quiz Types for Student Role

export interface QuizDetails {
  id: number;
  title: string;
  durationMinutes: number;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  submissions: number;
  averageScore: number;
}

export interface Question {
  id: number;
  text: string;
  points: number;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface QuizQuestionsResponse {
  apiResponse: {
    message: string;
    'Quiz Questions': Question[];
  };
}

export interface QuizAnswer {
  questionId: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface QuizSubmitRequest {
  answers: QuizAnswer[];
}

export interface QuizSubmitResponse {
  apiResponse: {
    Score: string;
    message: string;
  };
}

export interface QuizDetailsResponse {
  apiResponse: {
    'Quiz Details': QuizDetails;
    message: string;
  };
}

