import type { ProjectSubmission } from '../../../../../types/student-role-types/achievement.types';

export interface ProjectsSectionProps {
  projects:      ProjectSubmission[];
  currentPage:   number;
  totalPages:    number;
  onPageChange:  (page: number) => void;
  onViewDetails: (id: string) => void;
}