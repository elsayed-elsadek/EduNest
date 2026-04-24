import type { FC } from 'react';
import type { StatCardProps } from './StatsCards.types';

const StatCard: FC<StatCardProps> = ({ label, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-2">
    <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
      {label}
    </p>
    <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
      {children}
    </div>
  </div>
);

export default StatCard;