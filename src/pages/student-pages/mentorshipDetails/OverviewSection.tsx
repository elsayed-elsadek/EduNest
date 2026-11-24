import { type FC } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MentorInfo from './components/MentorInfo';
import LearnList from './components/LearnList';
import TagsList from './components/TagsList';
import TopMentorships from './components/TopMentorships';
import type { MentorshipDetails } from '../../../types/student-role-types/studentMentorshipTypes';

interface MentorshipDetailsOutletContext {
  mentorship?: MentorshipDetails;
  isLoading: boolean;
  mentorshipId: string;
  isEnrolled?: boolean;
}

const OverviewSection: FC = () => {
  const { mentorship, isLoading, mentorshipId, isEnrolled } = useOutletContext<MentorshipDetailsOutletContext>();
  const navigate = useNavigate();

  const handleSelectMentorship = (id: string) => {
    if (id === mentorshipId) return;
    navigate(`/mentorships/${id}`);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr] w-full min-w-0 overflow-hidden">
      
      <div className="space-y-8 min-w-0 w-full">
        <MentorInfo mentorship={mentorship} isLoading={isLoading} />

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm min-w-0 w-full overflow-hidden">
          <div className="flex items-center justify-between gap-4 w-full min-w-0">
            <div className="min-w-0 w-full">
              <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Description</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 truncate">About this mentorship</h2>
            </div>
          </div>
          <div className="mt-6 text-base leading-8 text-slate-700 min-w-0 w-full break-words whitespace-pre-wrap">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 rounded bg-gray-200 animate-pulse" />
              </div>
            ) : (
              <p>{mentorship?.description}</p>
            )}
          </div>
        </section>

        <LearnList items={mentorship?.whatWillLearn} isLoading={isLoading} />
        <TagsList tags={mentorship?.tags} isLoading={isLoading} />
      </div>

      <aside className="space-y-6 min-w-0 w-full">
        <div className="sticky top-24 space-y-4 min-w-0 w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm min-w-0 w-full overflow-hidden">
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Quick facts</p>
            <div className="mt-6 grid gap-4 min-w-0 w-full">
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4 min-w-0 w-full">
                <span className="text-sm text-slate-500 shrink-0">Category</span>
                <span className="font-semibold text-slate-900 break-words text-right min-w-0 flex-1">{isLoading ? '—' : mentorship?.category}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4 min-w-0 w-full">
                <span className="text-sm text-slate-500 shrink-0">Status</span>
                <span className="font-semibold text-slate-900 break-words text-right min-w-0 flex-1">{isLoading ? '—' : mentorship?.status}</span>
              </div>
              {!isEnrolled && (
                <>
                  <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4 min-w-0 w-full">
                    <span className="text-sm text-slate-500 shrink-0">Price</span>
                    <span className="font-semibold text-slate-900 break-words text-right min-w-0 flex-1">{isLoading ? '—' : `$${mentorship?.price}`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4 min-w-0 w-full">
                    <span className="text-sm text-slate-500 shrink-0">Discount</span>
                    <span className="font-semibold text-slate-900 break-words text-right min-w-0 flex-1">{isLoading ? '—' : `${mentorship?.discountPercentage}%`}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {!isEnrolled && (
        <div className="xl:col-span-2 min-w-0 w-full">
          <TopMentorships mentorships={mentorship?.topMentorMentorships} isLoading={isLoading} onSelect={handleSelectMentorship} />
        </div>
      )}
    </div>
  );
};

export default OverviewSection;
