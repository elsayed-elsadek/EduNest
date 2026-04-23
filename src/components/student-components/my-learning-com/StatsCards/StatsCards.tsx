import type { FC } from 'react';
import StatCard from './StatCard';
import type { StatsCardsProps } from './StatsCards.types';

const StatsCards: FC<StatsCardsProps> = ({ data }) => {
  const { completedCount, averageProgress, progressDelta, totalPoints } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Completed */}
      <StatCard label="Completed">
        <span>{completedCount}</span>
        <span className="text-base font-semibold text-blue-600">Mentorships</span>
      </StatCard>

      {/* Average Progress */}
      <StatCard label="Average Progress">
        <span>{averageProgress}%</span>
        <span className="text-sm font-semibold text-yellow-500">
          +{progressDelta}% this wk
        </span>
      </StatCard>

      {/* Total Points */}
      <StatCard label="Total Points">
        <span>{totalPoints.toLocaleString()}</span>
        <span className="text-2xl">⭐</span>
      </StatCard>
    </div>
  );
};

export default StatsCards;