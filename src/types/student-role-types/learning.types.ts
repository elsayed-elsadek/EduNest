

export type TabKey = 'enrollment' | 'achievement' | 'certification';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVEL';

export type DeadlineStatus = 'DEADLINE' | 'UPCOMING' | 'NEW_CONTENT';

export type MentorshipStatus = 'ACTIVE' | 'COMPLETED' | 'PENDING';

// ─── Raw API shapes ───────────────────────────────────────────────────────────

export interface MentorshipApi {
  mentorshipId:       number;
  title:              string;
  subtitle:           string | null;
  category:           string;
  difficultyLevel:    DifficultyLevel;
  coverImageUrl:      string | null;
  totalPoints:        number;
  progressPercentage: number;
  totalTasks:         number;
  submittedTasks:     number;
  totalQuizzes:       number;
  submittedQuizzes:   number;
  totalProjects:      number;
  submittedProjects:  number;
  totalLectures:      number;
  status:             MentorshipStatus;
}

export interface MyLearningDataApi {
  completedMentorships: number;
  averageProgress:      number;
  totalPoints:          number;
  mentorships: {
    content:       MentorshipApi[];
    page:          number;
    size:          number;
    totalElements: number;
    totalPages:    number;
  };
}

// ─── UI shapes ────────────────────────────────────────────────────────────────

export interface MentorshipStats {
  tasks: { done: number; total: number };
  quiz:  { done: number; total: number };
  proj:  { done: number; total: number };
  lect:  { done: number; total: number };
}

export interface Mentorship {
  id:           string;
  title:        string;
  subtitle:     string;
  thumbnail:    string;
  level:        DifficultyLevel;
  category:     string;
  progress:     number;
  stats:        MentorshipStats;
  currentWeek:  number;
  statusLabel:  string;
  statusType:   DeadlineStatus;
  status:       MentorshipStatus;
}

export interface LearningStatsData {
  completedCount:  number;
  averageProgress: number;
  progressDelta:   number;   
  totalPoints:     number;
}