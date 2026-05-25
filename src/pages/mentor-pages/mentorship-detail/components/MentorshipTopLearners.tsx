import type { FC } from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Learner } from '../types';
import ModalOverlay from '../../mentorship-content/components/ModalOverlay';

interface MentorshipTopLearnersProps {
  topLearners: Learner[];
  topPage: number;
  topTotalPages: number;
  onPageChange: (page: number) => void;
  topSize: number;
}

const MentorshipTopLearners: FC<MentorshipTopLearnersProps> = ({
  topLearners,
  topPage,
  topTotalPages,
  onPageChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderLearner = (t: Learner, i: number) => (
    <div key={i} className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
          {(t.firstName || t.lastName || 'T').charAt(0)}
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-900">
            {t.firstName} {t.lastName}
          </p>
          {t.progress !== undefined && (
            <p className="text-xs text-gray-400">Progress: {t.progress}%</p>
          )}
        </div>
      </div>
      <div className="text-xs text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-full">
        {t.totalPoints ?? 0} pts
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 text-lg">Top Learners</h3>

        {topTotalPages > 1 ? (
  <div className="flex items-center gap-2">
  {/* زر السابق */}
  <button
    type="button"
    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white bg-[var(--primary-500)] hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
    onClick={() => onPageChange(Math.max(topPage - 1, 0))}
    disabled={topPage <= 0}
    aria-label="Previous page"
  >
    <ChevronLeft className="h-5 w-5" />
  </button>

  <span className="text-sm font-semibold text-gray-700 tabular-nums px-2">
    {topPage + 1} <span className="text-gray-400 font-normal">/ {topTotalPages}</span>
  </span>

  {/* زر التالي */}
  <button
    type="button"
    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white bg-[var(--primary-500)] hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
    onClick={() => onPageChange(Math.min(topPage + 1, topTotalPages - 1))}
    disabled={topPage >= topTotalPages - 1}
    aria-label="Next page"
  >
    <ChevronRight className="h-5 w-5" />
  </button>
</div>
        ) : topLearners.length > 3 ? (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-semibold text-[var(--primary-500)] hover:underline transition"
          >
            View all
          </button>
        ) : null}
      </div>

      <div className="space-y-5">
        {topLearners.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No learners data available</p>
        ) : (
          topLearners.slice(0, 3).map((t, i) => renderLearner(t, i))
        )}
      </div>

      {isModalOpen && (
        <ModalOverlay
          title="All Top Learners"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {topLearners.map((t, i) => renderLearner(t, i))}
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default MentorshipTopLearners;