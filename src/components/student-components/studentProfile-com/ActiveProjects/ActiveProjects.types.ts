import type { ActiveProject } from '../../../../types/student-role-types/profile.types';

export interface ProjectItemProps {
  project: ActiveProject;
  onViewSubmission: (id: string) => void;
  onMoreOptions:    (id: string) => void;
}

export interface ActiveProjectsProps {
  projects:         ActiveProject[];
  currentPage:      number;
  totalPages:       number;
  onPageChange:     (page: number) => void;
  onViewSubmission: (id: string) => void;
  onMoreOptions:    (id: string) => void;
}