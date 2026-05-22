import type { FC } from 'react';
import { ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import BadgeCard from '../BadgeCard/BadgeCard';
import type { BadgesSectionProps } from './BadgesSection.types';

const BadgesSection: FC<BadgesSectionProps> = ({
  badges,
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) => {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Badges</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            Page {currentPage} of {totalPages}
            <span className="w-2 h-2 rounded-full bg-gray-800 inline-block" />
          </span>
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Badge Cards */}
      <div className="flex gap-4">
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
};

export default BadgesSection;