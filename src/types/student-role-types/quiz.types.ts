
export interface Quiz {
  id: number;
  title: string;
  durationMinutes: number;
  description: string | null;
  status: string;
  submissions: number;
  averageScore: number;
  totalPoints: number;
}

export interface Question {
  id: number;
  text: string;
  points: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface Answer {
  questionId: number;
  selectedAnswer: string;
}

export interface StudentDetails {
  id: number;
  studentId: number;
  studentName: string;
  score: number;
  totalPoints: number;
  status: string;
}

export interface QuizSubmissionResponse {
  message: string;
  'Student details': StudentDetails;
}

export interface ReviewAnswerItem {
  questionId: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  selectedAnswer: string;
}

export interface MyAnswersResponse {
  Review: ReviewAnswerItem[];
  message: string;
}

export interface StudentAnswerItem {
  questionId: number;
  selectedAnswer: string;
}

export interface StudentAnswersResponse {
  Answers?: StudentAnswerItem[];
  answers?: StudentAnswerItem[];
  Score?: string;
}