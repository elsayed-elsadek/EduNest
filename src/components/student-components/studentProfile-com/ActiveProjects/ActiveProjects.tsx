import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectItem from './ProjectItem';
import type { ActiveProjectsProps } from './ActiveProjects.types';

const ActiveProjects: FC<ActiveProjectsProps> = ({
  projects,
  currentPage,
  totalPages,
  onPageChange,
}) => (
  <div className="flex flex-col gap-4">
    {/* Header */}
    <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>

    {/* Project List */}
    <div className="flex flex-col gap-3">
      {projects.map((p) => (
        <ProjectItem
          key={p.id}
          project={p}
        />
      ))}
    </div>

    {/* Pagination Row */}
    <div className="flex items-center justify-between pt-1">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          PREV
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                page === currentPage
                  ? 'bg-[#0c2d48] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          NEXT
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

export default ActiveProjects;