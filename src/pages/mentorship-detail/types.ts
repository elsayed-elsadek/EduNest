import type { WeekResponse, WeekContentItem } from '../../services/mentorshipsContent';


export interface Learner {
    name?: string;
    userName?: string;
    progress?: number | string;
    points?: number | string;
}

export interface Review {
    userName?: string;
    name?: string;
    rating?: number;
    comment?: string;
    message?: string;
}

export interface Student {
    name?: string;
    fullName?: string;
    email?: string;
    status?: string;
    progress?: number | string;
}

export interface MentorshipStats {
    lessons?: number | string;
    quizzes?: number | string;
    assignments?: number | string;
    sessions?: number | string;
    [key: string]: unknown;
}

export interface WeekData {
    week: WeekResponse;
    items: WeekContentItem[];
}
