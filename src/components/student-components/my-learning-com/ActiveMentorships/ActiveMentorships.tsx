
import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MentorshipCard from '../MentorshipCard/MentorshipCard';
import type { ActiveMentorshipsProps } from './ActiveMentorships.types';

const ActiveMentorships: FC<ActiveMentorshipsProps> = ({
  mentorships,
  onContinue,
  onPrevSlide,
  onNextSlide,
  canGoPrev,
  canGoNext,
}) => {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Mentorships</h2>
          <p className="text-sm text-gray-500 mt-0.5">Continue your scholarly journey</p>
        </div>

        {/* Slide Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevSlide}
            disabled={!canGoPrev}
            className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onNextSlide}
            disabled={!canGoNext}
            className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentorships.map((m) => (
          <MentorshipCard key={m.id} mentorship={m} onContinue={onContinue} />
        ))}
      </div>
    </div>
  );
};

export default ActiveMentorships;