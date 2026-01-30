

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  activeMentorships: number;
  completedMentorships: number;
  enrolledDate?: string;
}