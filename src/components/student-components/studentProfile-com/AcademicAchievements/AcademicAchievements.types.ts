import type { AchievementBadge } from '../../../../types/student-role-types/profile.types';

export interface BadgeCardProps {
  badge: AchievementBadge;
}

export interface AcademicAchievementsProps {
  badges:       AchievementBadge[];
  currentPage:  number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}