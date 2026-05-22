
export interface ContinueLearningDto {
  mentorshipId:       number;
  title:              string;
  coverImageUrl:      string | null;
  mentorName:         string;
  progressPercentage: number;
  completedItems:     number;
  totalItems:         number;
}

export interface RecommendedMentorshipDto {
  id:                 number;
  title:              string;
  duration:           number;
  description:        string;
  coverImageUrl:      string | null;
  mentorName:         string;
  subtitle:           string;
  difficultyLevel:    'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVEL';
  price:              number;
  discountPercentage: number;
  mentorEmail:        string;
}

export interface UpcomingItemDto {
  id:              number | string;
  type:            'SESSION' | 'TASK' | 'PROJECT' | 'QUIZ' | 'MENTORSHIP' | 'ASSIGNMENT';
  title:           string;
  description?:    string;
  dueDate?:        string;       // ISO
  startTime?:      string;       // ISO
  status:          'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  // extra fields from API
  mentorshipId?:   number;
  mentorshipTitle?: string;
  weekId?:         number;
  weekTitle?:      string;
  points?:         number | null;
}

export interface HomepageDataDto {
  continueLearning:       ContinueLearningDto[];
  recommendedMentorships: RecommendedMentorshipDto[];
  upcomingItems:          UpcomingItemDto[];
}

export interface HomepageApiResponse {
  apiResponse: {
    data:    HomepageDataDto;
    message: string;
  };
}

export interface DashboardStats {
  mentorshipSessions: number;   // SESSION type count
  projectDeadlines:   number;   // PROJECT type count
  assignments:        number;   // TASK type count
  totalUpcoming:      number;
}