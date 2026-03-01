
export interface Student {
  id: string;
  name: string;
  email: string;
  address: string;
  avatar?: string;
  coverImage?: string;
  activeMentorships: number;
  totalPoints: number;
  completedMentorships: number;
}

export interface Mentorship {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  startDate: string;
  totalPoints: number;
  quizzes: number;           
  submittedQuizzes: number;  
  assignments: number;       
  submittedTasks: number;    
  status: 'Completed' | 'In progress';
}

export interface Project {
  projectSubmissionId: number | string;
  projectTitle: string;
  mentorshipTitle: string;
  status: 'SUBMITTED' | 'Approved' | 'Rejected' | 'Pending Review';
  submittedAt: string;
  gradedAt?: string | null;
  submissionLink?: string;     
  filesCount?: number;
  feedback?: string | null;
  rawScore?: number | null;
  finalScore?: number | null;
}

export interface SocialMedia {
  platform: 'LinkedIn' | 'Facebook' | 'GitHub';
  username: string;
  url?: string;
}

export type ProjectTab = 'projects' | 'badges';