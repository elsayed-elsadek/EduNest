import type { ComponentType, FC } from 'react';
import { Award, Brain, Lightbulb, Lock, Star, Target, Trophy, Users, Zap } from 'lucide-react';
import type { BadgeCardProps } from './AcademicAchievements.types';

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

const BadgeCard: FC<BadgeCardProps> = ({ badge }) => {
  if (!badge.unlocked) {
    return (
      <div className="flex-1 min-w-[200px] border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center bg-gray-50">
        <Lock className="w-8 h-8 text-gray-300" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Next Achievement
        </p>
        <p className="text-xs text-gray-400">{badge.nextHint}</p>
      </div>
    );
  }

  const BadgeIcon = ICON_MAP[badge.icon] ?? Award;

  return (
    <div className="flex-1 min-w-[180px] bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
      {/* Icon */}
      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
        <BadgeIcon className="w-6 h-6 text-yellow-700" />
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-sm font-bold text-gray-900">{badge.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
          {badge.points} POINTS
        </span>
        <span className="text-[10px] text-gray-400">By {badge.awardedBy}</span>
      </div>
    </div>
  );
};

export default BadgeCard;