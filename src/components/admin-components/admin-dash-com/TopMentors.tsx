import { type FC, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MentorRow from './MentorRow';
import type { TopMentorsProps } from '../../../types/admin-role-types/admin-dash.types';

const VISIBLE_THRESHOLD = 3;

const TopMentors: FC<TopMentorsProps> = ({ mentors }) => {
  const [expanded, setExpanded] = useState(false);

  const hasMore      = mentors.length > VISIBLE_THRESHOLD;
  const visibleList  = hasMore && !expanded
    ? mentors.slice(0, VISIBLE_THRESHOLD)
    : mentors;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Top Mentors</h3>
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
          High Performers
        </span>
      </div>

      {/* List */}
      <div className="flex-1">
        {visibleList.map(m => (
          <MentorRow key={m.rank} mentor={m} />
        ))}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="flex items-center justify-center gap-1.5 w-full mt-3 py-2 text-xs font-semibold text-[#0f5e8b] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Show {mentors.length - VISIBLE_THRESHOLD} More
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TopMentors;