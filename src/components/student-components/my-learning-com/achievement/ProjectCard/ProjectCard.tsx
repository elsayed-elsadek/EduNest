import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ProjectCardProps } from './ProjectCard.types';
import type { ProjectStatus } from '../../../../../types/student-role-types/achievement.types';

const STATUS_STYLES: Record<ProjectStatus, { dot: string; label: string; text: string }> = {
  APPROVED: { dot: 'bg-green-500',  label: 'APPROVED', text: 'text-green-700'  },
  PENDING:  { dot: 'bg-yellow-500', label: 'PENDING',  text: 'text-yellow-700' },
  REVISION: { dot: 'bg-red-500',    label: 'REVISION', text: 'text-red-700'    },
};

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const { id, mentorshipId, status, category, title, mentorQuote, mentorName, mentorRole } = project;
  const st = STATUS_STYLES[status];

  const handleViewDetails = () => {
    if (!mentorshipId) return;
    navigate(`/student/learning/${mentorshipId}`, {
      state: {
        itemId:  id,
        itemKey: `PROJECT-${id}`,
      },
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
      {/* Status Badge */}
      <div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border border-gray-200 ${st.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </div>

      {/* Category + Title */}
      <div>
        <p className="text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-1">
          {category}
        </p>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      </div>

      {/* Mentor Quote */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative">
        {/* Big quotation mark */}
        <span className="absolute -top-1 left-3 text-4xl text-gray-300 font-serif leading-none select-none">
          "
        </span>
        <p className="text-sm text-gray-600 italic pt-3 leading-relaxed">
          "{mentorQuote}"
        </p>
        <p className="text-xs font-semibold text-gray-500 mt-2">
          — {mentorName}, {mentorRole}
        </p>
      </div>

      {/* CTA */}
      <div>
        <button
          onClick={handleViewDetails}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0c2d48] text-white text-sm font-bold rounded-xl hover:bg-[#0a2438] transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;