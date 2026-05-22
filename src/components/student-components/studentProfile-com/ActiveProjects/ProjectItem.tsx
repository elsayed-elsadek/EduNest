import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectItemProps } from './ActiveProjects.types';
import type { ProjectStatus } from '../../../../types/student-role-types/profile.types';

const STATUS_STYLES: Record<ProjectStatus, string> = {
  SUBMITTED:   'bg-blue-50  text-blue-700  border-blue-200',
  IN_PROGRESS: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PENDING:     'bg-gray-50  text-gray-600  border-gray-200',
  APPROVED:    'bg-green-50 text-green-700 border-green-200',
  GRADED:      'bg-purple-50 text-purple-700 border-purple-200',
  REJECTED:    'bg-red-50  text-red-700  border-red-200',
};

const ProjectItem: FC<ProjectItemProps> = ({ project }) => {
  const navigate = useNavigate();
  const { id, mentorshipId, title, mentorship, completion, status } = project;

  const handleViewSubmission = () => {
    if (!mentorshipId) return;
    navigate(`/student/learning/${mentorshipId}`, {
      state: {
        itemId:  id,
        itemKey: `PROJECT-${id}`,
      },
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Mentorship: {mentorship}</p>
        </div>
        <span className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_STYLES[status]}`}>
          {status.replace('_', ' ')}
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Completion
          </span>
          <span className="text-xs font-bold text-gray-700">{completion}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0c2d48] rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleViewSubmission}
          className="flex-1 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProjectItem;