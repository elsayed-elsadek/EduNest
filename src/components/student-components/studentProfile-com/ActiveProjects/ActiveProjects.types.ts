import type { ActiveProject } from '../../../../types/student-role-types/profile.types';

export interface ProjectItemProps {
  project: ActiveProject;
}

export interface ActiveProjectsProps {
  projects:    ActiveProject[];
  currentPage: number;
  totalPages:  number;
  onPageChange: (page: number) => void;
}