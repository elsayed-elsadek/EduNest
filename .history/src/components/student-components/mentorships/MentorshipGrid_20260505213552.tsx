import type { FC } from 'react';
import MentorshipCard from './MentorshipCard';
import type { MentorshipData } from '../../../types/mentorship';

interface MentorshipGridProps {
  mentorships: MentorshipData[];
  isLoading?: boolean;
  onItemClick?: (mentorship: MentorshipData) => void;
  onItemHover?: (mentorship: MentorshipData) => void;
}

/**
 * Skeleton loader معدل ليتناسب مع العرض الكامل (Horizontal)
 */
const CardSkeleton: FC = () => (
  <div className="w-full flex flex-col md:flex-row rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 animate-pulse mb-4">
    <div className="h-48 md:h-auto md:w-64 bg-gray-200" /> {/* مساحة الصورة */}
    <div className="p-5 flex-1 space-y-4">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-8 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  </div>
);

/**
 * MentorshipList Component (One per row)
 */
const MentorshipGrid: FC<MentorshipGridProps> = ({
  mentorships,
  isLoading = false,
  onItemClick,
  onItemHover,
}) => {

  // حالة التحميل
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {Array.from({ length: 5 }).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  // حالة عدم وجود بيانات
  if (!mentorships || mentorships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">No mentorships found</h3>
        <p className="text-gray-500 mt-1">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-5 w-full">
      {mentorships.map((mentorship) => (
        <div key={mentorship.id} className="w-full">
          <MentorshipCard
            mentorship={mentorship}
            onClick={() => onItemClick?.(mentorship)}
            onHover={() => onItemHover?.(mentorship)}
          />
        </div>
      ))}
    </div>
  );
};

export default MentorshipGrid;