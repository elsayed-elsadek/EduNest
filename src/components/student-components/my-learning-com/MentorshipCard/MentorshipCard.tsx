
import type { FC } from 'react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { MentorshipCardProps } from './MentorshipCard.types';
import { theme } from '../../../../theme/colors';
import NoCover from '../../common/Nocover/Nocover';

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER:     'bg-gray-800 text-white',
  INTERMEDIATE: 'bg-gray-800 text-white',
  ADVANCED:     'bg-gray-800 text-white',
  ALL_LEVEL:    'bg-gray-800 text-white',
};

const STATUS_COLORS: Record<string, string> = {
  DEADLINE:    'text-red-500',
  UPCOMING:    'text-yellow-500',
  NEW_CONTENT: 'text-blue-500',
};

const MentorshipCard: FC<MentorshipCardProps> = ({ mentorship, onContinue }) => {
  const { id, title, subtitle, thumbnail, level, category, progress, stats, currentWeek, statusLabel, statusType } = mentorship;
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = !thumbnail || imgError;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
      {/* Thumbnail / Placeholder */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {showPlaceholder ? (
          <NoCover title={title} />
        ) : (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full ${LEVEL_COLORS[level] ?? 'bg-gray-800 text-white'}`}>
            {level}
          </span>
          {category && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full bg-gray-800 text-white">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-bold" style={{ color: theme.primary[500] }}>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: theme.primary[500] }}
            />
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-4 gap-2 py-2 border-t border-gray-100">
          {(
            [
              { label: 'TASKS', val: stats.tasks },
              { label: 'QUIZ',  val: stats.quiz  },
              { label: 'PROJ',  val: stats.proj  },
              { label: 'LECT',  val: stats.lect  },
            ] as const
          ).map(({ label, val }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase">{label}</span>
              <span className="text-xs font-bold text-gray-700 mt-0.5">{val.done}/{val.total}</span>
            </div>
          ))}
        </div>

        {/* Footer Row */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-2 mt-auto">
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">CURRENT</p>
            <p className="text-sm font-bold text-gray-800">Week {String(currentWeek).padStart(2, '0')}</p>
          </div>
          <div className="text-right">
            <p className={`text-[9px] font-semibold uppercase tracking-wider ${STATUS_COLORS[statusType] ?? 'text-gray-400'}`}>
              {statusType.replace('_', ' ')}
            </p>
            <p className="text-xs font-medium text-gray-700">{statusLabel}</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onContinue(id)}
          className="w-full mt-1 py-3 bg-[#0c2d48] hover:bg-[#0a2438] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors duration-200"
        >
          Continue Journey
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MentorshipCard;