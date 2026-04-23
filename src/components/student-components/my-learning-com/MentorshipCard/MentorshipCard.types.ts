import type { Mentorship } from '../../../../types/student-role-types/learning.types';

export interface MentorshipCardProps {
  mentorship: Mentorship;
  onContinue: (id: string) => void;
}