
import type { ComponentType, FC } from 'react';
import { Award, Brain, Lightbulb, Star, Target, Trophy, Users, Zap } from 'lucide-react';
import type { BadgeCardProps } from './BadgeCard.types';
import type { BadgeColor } from '../../../../../types/student-role-types/achievement.types';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  award: Award,
  zap: Zap,
  target: Target,
  users: Users,
  trophy: Trophy,
  brain: Brain,
  lightbulb: Lightbulb,
  star: Star,
};

const COLOR_MAP: Record<BadgeColor, { bg: string; icon: string }> = {
  blue:   { bg: 'bg-blue-100',   icon: 'text-blue-600'   },
  yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  green:  { bg: 'bg-green-100',  icon: 'text-green-600'  },
  red:    { bg: 'bg-red-100',    icon: 'text-red-600'    },
};

const POINTS_BG: Record<BadgeColor, string> = {
  blue:   'bg-blue-100   text-blue-700',
  yellow: 'bg-yellow-400 text-yellow-900',
  purple: 'bg-purple-100 text-purple-700',
  green:  'bg-green-100  text-green-700',
  red:    'bg-red-100    text-red-700',
};

const BadgeCard: FC<BadgeCardProps> = ({ badge }) => {
  const { title, description, points, icon, color } = badge;
  const colors = COLOR_MAP[color];
  const BadgeIcon = ICON_MAP[icon] ?? Award;

  return (
    <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
      {/* Icon Circle */}
      <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center`}>
        <BadgeIcon className={`w-8 h-8 ${colors.icon}`} />
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>

      {/* Points Badge */}
      <span className={`px-3 py-1 text-xs font-bold rounded-full ${POINTS_BG[color]}`}>
        +{points} PTS
      </span>
    </div>
  );
};

export default BadgeCard;