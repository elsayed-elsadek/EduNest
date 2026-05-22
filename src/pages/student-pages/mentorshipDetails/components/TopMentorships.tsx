import type { FC } from 'react';
import MentorshipCard from '../../../../components/student-components/mentorships/MentorshipCard';
import type { MentorshipSummary } from '../../../../types/student-role-types/studentMentorshipTypes';

interface TopMentorshipsProps {
  mentorships?: MentorshipSummary[];
  isLoading?: boolean;
  onSelect?: (id: number) => void;
}

const TopMentorships: FC<TopMentorshipsProps> = ({ mentorships = [], isLoading = false, onSelect }) => {
  // const [showAll, setShowAll] = useState(false);

  const displayedMentorships =  mentorships.slice(0, 3);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Top mentorships</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">By the same mentor</h2>
        </div>



      </div>

      <div className="mt-6 space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[260px] max-w-[340px] animate-pulse rounded-3xl bg-gray-100" />
            ))
          : displayedMentorships.length > 0
          ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3   ">
              {displayedMentorships.map((mentorship) => (
                <div key={mentorship.id} className="w-full">
                  <MentorshipCard
                     mentorship={mentorship}
                    onClick={() => onSelect?.(mentorship.id)}
                  />
                </div>
              ))}
            </div>
          )
          : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-slate-500">
              No additional mentorships by this mentor are available right now.
            </div>
          )}
      </div>
    </section>
  );
};

export default TopMentorships;
