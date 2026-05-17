
import type { ComponentType } from 'react';

export interface Student {
  id:                   string;
  name:                 string;
  email:                string;
  address:              string;
  avatar?:              string;
  coverImage?:          string;
  activeMentorships:    number;
  completedMentorships: number;
  totalPoints:          number;
}

export interface Mentorship {
  id:               string;
  name:             string;
  imageUrl?:        string;   // absolute URL from API mentorship cover image
  icon:             string;   // fallback string label if no image
  iconComponent?:   ComponentType<{ size?: number; className?: string }>;
  iconColor:        string;   // fallback bg color if no image
  startDate:        string;
  totalPoints:      number;
  quizzes:          number;
  submittedQuizzes: number;
  assignments:      number;
  submittedTasks:   number;
  status:           'Completed' | 'In progress';
}

export interface Project {
  projectSubmissionId: number | string;
  projectTitle:        string;
  mentorshipTitle:     string;
  status:              'SUBMITTED' | 'Approved' | 'Rejected' | 'Pending Review' | 'GRADED' | 'REJECTED';
  submittedAt:         string;
  gradedAt?:           string | null;
  submissionLink?:     string;
  filesCount?:         number;
  feedback?:           string | null;
  rawScore?:           number | null;
  finalScore?:         number | null;
}

export interface SocialMedia {
  platform: 'LinkedIn' | 'Facebook' | 'GitHub';
  username: string;
  url?:     string;
}

export interface AwardedBadge {
  id:               number;
  badgeId:          number;
  badgeTitle:       string;
  studentId:        number;
  studentFullName:  string;
  awardedById:      number;
  awardedAt:        string;
  note?:            string;
  badgePoints:      number;
}

export type ProjectTab = 'projects' | 'badges';