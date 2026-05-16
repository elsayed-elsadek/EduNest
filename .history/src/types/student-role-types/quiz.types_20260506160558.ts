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

export interface StudentQuizScore {
  score: string;
  submittedAt: string;
  isSubmitted: boolean;
}