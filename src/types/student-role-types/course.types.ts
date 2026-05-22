
export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NEW';
  category: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'MENTORSHIP' | 'ASSIGNMENT' | 'PROJECT' | 'SESSION' | 'QUIZ' | 'TASK';
  title: string;
  description?: string;
  time: string;
  date: string;
  status: 'UPCOMING' | 'COMPLETED' | 'IN_PROGRESS';
  icon?: string;
  mentorshipId?: number;
  weekId?: number;
  itemId?: number;
}

