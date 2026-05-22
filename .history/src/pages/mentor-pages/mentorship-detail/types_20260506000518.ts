import type { WeekResponse, WeekContentItem } from '../../../services/mentorshipsContent';


export interface Learner {
    studentId?: number;
    firstName?: string;
    lastName?: string;
    totalPoints?: number | string;
    progress?: number | string; // keeping for backward compatibility if needed
}

export interface Review {
    feedBack: string | undefined;
    studentName: string | undefined;
    studentName: string;
    userName?: string;
    name?: string;
    rating?: number;
    comment?: string;
    message?: string;
    reviewerName?: string; // added for potential future use or alternative naming
    createdAt?: string;
}

export interface Student {
    studentId?: number;
    studentName?: string;
    studentEmail?: string;
    totalPoints?: number | string;
    rank?: number;
    status?: string;
    progress?: number | string;
}

export interface MentorshipStats {
    title?: string;
    status?: string;
    totalLessons?: number | string;
    totalQuizzes?: number | string;
    totalAssignments?: number | string;
    totalSessions?: number | string;
    totalProjects?: number | string;
    [key: string]: unknown;
}

export interface WeekData {
    week: WeekResponse;
    items: WeekContentItem[];
}
