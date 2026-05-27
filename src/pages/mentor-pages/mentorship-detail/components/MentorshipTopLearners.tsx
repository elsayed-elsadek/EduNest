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

  // function to render each learner in the list with proper styling and responsive design
  const renderLearner = (t: Learner, i: number) => (
    <div key={i} className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Avatar - مدمج في الشاشات الصغيرة */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600 shrink-0">
          {(t.firstName || t.lastName || 'T').charAt(0)}
        </div>
        
        {/* Name & Progress */}
        <div className="flex flex-col min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
            {t.firstName} {t.lastName}
          </p>
          {t.progress !== undefined && (
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              Progress: {t.progress}%
            </p>
          )}
        </div>
      </div>

      {/* Points Badge - مدمج في الشاشات الصغيرة */}
      <div className="text-[10px] sm:text-xs text-yellow-500 font-bold bg-yellow-50 px-2 py-0.5 sm:py-1 rounded-full shrink-0">
        {t.totalPoints ?? 0} pts
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">Top Learners</h3>

{/* pagination */}
        {topTotalPages > 1 ? (
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/*prev button*/}
            <button
              type="button"
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-white bg-[var(--primary-500)] hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              onClick={() => onPageChange(Math.max(topPage - 1, 0))}
              disabled={topPage <= 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <span className="text-xs sm:text-sm font-semibold text-gray-700 tabular-nums px-1">
              {topPage + 1} <span className="text-gray-400 font-normal">/ {topTotalPages}</span>
            </span>

            {/* next button */}
            <button
              type="button"
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-white bg-[var(--primary-500)] hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              onClick={() => onPageChange(Math.min(topPage + 1, topTotalPages - 1))}
              disabled={topPage >= topTotalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        ) : topLearners.length > 3 ? (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-xs sm:text-sm font-semibold text-[var(--primary-500)] hover:underline transition shrink-0"
          >
            View all
          </button>
        ) : null}
      </div>

      {/* قائمة الطلاب بـ spacing مرن ومتناسب */}
      <div className="space-y-4 sm:space-y-5">
        {topLearners.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No learners data available</p>
        ) : (
          topLearners.slice(0, 3).map((t, i) => renderLearner(t, i))
        )}
      </div>

      {/* الـ ModalOverlay المخصص لعرض الكل */}
      {isModalOpen && (
        <ModalOverlay
          title="All Top Learners"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="space-y-4 sm:space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {topLearners.map((t, i) => renderLearner(t, i))}
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default MentorshipTopLearners;