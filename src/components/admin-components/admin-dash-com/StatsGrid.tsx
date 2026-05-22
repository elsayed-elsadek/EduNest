import type { FC } from 'react';
import StatCard from './StatCard';
import type { StatsGridProps } from '../../../types/admin-role-types/admin-dash.types';

const StatsGrid: FC<StatsGridProps> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
    {stats.map(s => (
      <StatCard key={s.id} data={s} />
    ))}
  </div>
);

export default StatsGrid;