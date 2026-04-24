import type { ProjectSubmission } from '../../../../../types/student-role-types/achievement.types';

export interface ProjectCardProps {
  project:     ProjectSubmission;
  onViewDetails: (id: string) => void;
}