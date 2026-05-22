import type { FC } from 'react';
import BadgeCard from './BadgeCard';
import Pagination from '../../common/Pagination/Pagination';
import type { AcademicAchievementsProps } from './AcademicAchievements.types';

const AcademicAchievements: FC<AcademicAchievementsProps> = ({
  badges,
  currentPage,
  totalPages,
  onPageChange,
}) => (
  <div>
    {/* Header */}
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-900">Academic Achievements</h2>
      <p className="text-xs text-gray-500 mt-0.5">Verified milestones and behavioral badges.</p>
    </div>

    {/* Badge Cards */}
    <div className="flex flex-wrap gap-4">
      {badges.map((b) => (
        <BadgeCard key={b.id} badge={b} />
      ))}
    </div>

    {/* Pagination */}
    <div className="mt-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  </div>
);

export default AcademicAchievements;