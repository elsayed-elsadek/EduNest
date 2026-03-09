import api from '../api';
import { handleRequest } from './utils';

export interface CreateQuizPayload {
    weekId: number;
    title: string;
    description?: string;
    durationMinutes: number;
    status?: 'DRAFT' | 'PUBLISHED';
}

export const createQuiz = async (payload: CreateQuizPayload): Promise<unknown> => {
    const body = { ...payload, status: payload.status ?? 'DRAFT' };
    const raw = await handleRequest(api.post<unknown>('api/v1/quiz', body));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).quiz ?? data.apiResponse;
        return res;
    }
    return raw;
};

/** Delete a quiz by its ID */
export const deleteQuiz = async (id: number): Promise<void> => {
    await handleRequest(api.delete<unknown>(`api/v1/quiz/${id}`));
};

/** Update a quiz by its ID */
export interface UpdateQuizPayload {
    title?: string;
    description?: string;
    durationMinutes?: number;
    status?: 'DRAFT' | 'PUBLISHED';
}

export const updateQuiz = async (id: number, payload: UpdateQuizPayload): Promise<unknown> => {
    const raw = await handleRequest(api.patch<unknown>(`api/v1/quiz/${id}`, payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>).quiz ?? data.apiResponse;
        return res;
    }
    return raw;
};

// --- New Endpoints ---

export interface QuizOverviewDtoPageResponse {
    content: QuizOverviewContent[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface QuizOverviewContent {
    id: number;
    title: string;
    status: 'DRAFT' | 'PUBLISHED';
    submissions: number;
    averageScore: number;
}

export interface QuizDashboardDTO {
    totalQuizzes: number;
    publishedCount: number;
    draftCount: number;
    averageScore: number;
}

export interface MentorshipQuizzesOverviewResponse {
    quizOverviewDtoPageResponse: QuizOverviewDtoPageResponse;
    quizDashboardDTO: QuizDashboardDTO;
}

export const getMentorshipQuizzesOverview = async (mentorshipId: number, page: number = 0, size: number = 6): Promise<MentorshipQuizzesOverviewResponse> => {
    const raw = await handleRequest(api.get<unknown>(`api/v1/quiz/mentorshipQuizzesOverview/${mentorshipId}?page=${page}&size=${size}`));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>)['Mentorship Details'];
        return res as MentorshipQuizzesOverviewResponse;
    }
    throw new Error('Invalid response structure');
};


export interface QuizStatistics {
    quizTitle: string;
    status: 'DRAFT' | 'PUBLISHED';
    totalStudents: number;
    totalSubmissions: number;
    averageScore: number;
    totalQuestions: number;
    totalPoints: number;
}

export interface Submission {
    id: number;
    studentId?: number;
    studentName: string;
    score: number | null;
    status: 'Passed' | 'Failed' | 'Not Submitted';
    // add other necessary fields if in API response
}

export interface QuizOverviewResponse {
    quizStatistics: QuizStatistics;
    submissions: Submission[];
}

export const getQuizOverview = async (quizId: number, page: number = 0, size: number = 6): Promise<QuizOverviewResponse> => {
    const raw = await handleRequest(api.get<unknown>(`api/v1/quiz/QuizOverview/${quizId}?page=${page}&size=${size}`));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>)['Quiz Details'];
        return res as QuizOverviewResponse;
    }
    throw new Error('Invalid response structure');
};

export const filterQuizzes = async (mentorshipId: number, quizName: string = '', status: string = '', page: number = 0, size: number = 6): Promise<QuizOverviewDtoPageResponse> => {
    const params = new URLSearchParams();
    if (quizName) params.append('quizName', quizName);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const raw = await handleRequest(api.get<unknown>(`api/v1/quiz/filter/${mentorshipId}?${params.toString()}`));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = (data.apiResponse as Record<string, unknown>)['Quizzes'];
        return res as QuizOverviewDtoPageResponse;
    }
    throw new Error('Invalid response structure');
};

// --- Question APIs ---

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

export interface CreateQuestionPayload {
    quizId: number;
    text: string;
    points: number;
    correctAnswer: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
}

export interface UpdateQuestionPayload {
    quizId?: number;
    text?: string;
    points?: number;
    correctAnswer?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
}

export interface QuizQuestionsResponse {
    questions: Question[];
    message: string;
}

export const getQuestionsByQuizId = async (quizId: number): Promise<QuizQuestionsResponse> => {
    const raw = await handleRequest(api.get<unknown>(`api/v1/question/fetch/${quizId}`));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = data.apiResponse as Record<string, unknown>;
        return {
            questions: ((res['Quiz Questions'] as Question[]) || []),
            message: (res['message'] as string) || 'Questions retrieved successfully'
        };
    }
    throw new Error('Invalid response structure');
};

export const createQuestion = async (payload: CreateQuestionPayload): Promise<Question> => {
    const raw = await handleRequest(api.post<unknown>('api/v1/question', payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = data.apiResponse as Record<string, unknown>;
        return (res['Question Details'] as Question);
    }
    throw new Error('Invalid response structure');
};

export const getQuestionById = async (questionId: number): Promise<Question> => {
    const raw = await handleRequest(api.get<unknown>(`api/v1/question/${questionId}`));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = data.apiResponse as Record<string, unknown>;
        return (res['Question Details'] as Question);
    }
    throw new Error('Invalid response structure');
};

export const updateQuestion = async (questionId: number, payload: UpdateQuestionPayload): Promise<Question> => {
    const raw = await handleRequest(api.patch<unknown>(`api/v1/question/${questionId}`, payload));
    const data = raw as Record<string, unknown>;
    if (data?.apiResponse && typeof data.apiResponse === 'object') {
        const res = data.apiResponse as Record<string, unknown>;
        return (res['Question Details'] as Question);
    }
    throw new Error('Invalid response structure');
};

export const deleteQuestion = async (quizId: number, questionId: number): Promise<void> => {
    await handleRequest(api.delete<unknown>(`api/v1/question/${quizId}/${questionId}`));
};
