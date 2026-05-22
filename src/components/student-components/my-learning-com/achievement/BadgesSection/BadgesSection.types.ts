import type { Badge } from '../../../../../types/student-role-types/achievement.types';

export interface BadgesSectionProps {
  badges:       Badge[];
  currentPage:  number;
  totalPages:   number;
  onPrev:       () => void;
  onNext:       () => void;
}