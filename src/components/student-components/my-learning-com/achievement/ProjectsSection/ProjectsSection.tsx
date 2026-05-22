
import type { FC } from 'react';
import { LayoutGrid } from 'lucide-react';
import ProjectCard from '../ProjectCard/ProjectCard';
import type { ProjectsSectionProps } from './ProjectsSection.types';

const ProjectsSection: FC<ProjectsSectionProps> = ({
  projects,
  currentPage,
  totalPages,
}) => {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Recent Project Submissions</h2>
        </div>

        {/* Dot Pagination Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 4) }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentPage - 1 ? 'bg-gray-800 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Project Cards — stacked vertically like the design */}
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;