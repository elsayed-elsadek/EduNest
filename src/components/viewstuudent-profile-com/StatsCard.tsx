
import type { FC } from 'react';
import type {  ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  iconBgColor?: string;
}

const StatsCard: FC<StatsCardProps> = ({ 
  icon, 
  label, 
  value, 
  iconBgColor = 'bg-blue-100' 
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;