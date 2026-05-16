
import type { FC } from 'react';
import { Users, Award, BookOpen, DollarSign } from 'lucide-react';
import type { StatCardProps } from '../../../types/admin-role-types/admin-dash.types';

const ICON_MAP = {
  students:    { Icon: Users,      bg: 'bg-blue-50',  color: 'text-[#0f5e8b]' },
  mentors:     { Icon: Award,      bg: 'bg-green-50', color: 'text-green-600' },
  mentorships: { Icon: BookOpen,   bg: 'bg-gray-100', color: 'text-gray-500'  },
  revenue:     { Icon: DollarSign, bg: 'bg-blue-50',  color: 'text-[#0f5e8b]' },
} as const;

const StatCard: FC<StatCardProps> = ({ data }) => {
  const { label, value, iconType } = data;
  const { Icon, bg, color } = ICON_MAP[iconType];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
      {/* Icon only — no watermark, no trend */}
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>

      <div>
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;