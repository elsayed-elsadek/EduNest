
import type { Mentorship } from '../../../../types/student-role-types/learning.types';

export interface ActiveMentorshipsProps {
  mentorships:    Mentorship[];
  onContinue:     (id: string) => void;
  onPrevSlide:    () => void;
  onNextSlide:    () => void;
  canGoPrev:      boolean;
  canGoNext:      boolean;
}