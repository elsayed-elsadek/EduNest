
import type { FC } from 'react';
import type { MentorRowProps } from '../../../types/admin-role-types/admin-dash.types';

const RANK_COLORS: Record<number, string> = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300   text-gray-700',
  3: 'bg-amber-600  text-amber-100',
};

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');

const getImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

const MentorRow: FC<MentorRowProps> = ({ mentor }) => {
  const { rank, name, students, revenue, profileImageUrl } = mentor;
  const imgUrl = getImageUrl(profileImageUrl);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-b-0">
      {/* Rank badge */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
        RANK_COLORS[rank] ?? 'bg-gray-100 text-gray-600'
      }`}>
        {rank}
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-[#0f5e8b] flex items-center justify-center">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback to initials if image fails
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.parentElement as HTMLElement).dataset.fallback = 'true';
            }}
          />
        ) : (
          <span className="text-[11px] font-bold text-white">{initials(name)}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-gray-900 truncate">{name}</p>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          {students} Students
        </p>
      </div>

      {/* Revenue — no trend icon */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-bold text-gray-700">{revenue}</p>
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider mt-0.5">
          Revenue
        </p>
      </div>
    </div>
  );
};

export default MentorRow;