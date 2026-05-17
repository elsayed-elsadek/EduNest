import { type FC } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MentorInfo from './components/MentorInfo';
import LearnList from './components/LearnList';
import TagsList from './components/TagsList';
import TopMentorships from './components/TopMentorships';
import type { MentorshipDetails } from '../../../types/student-role-types/studentMentorshipTypes';
import UpcomingItemsSection from './components/UpcomingItemsSection';

interface MentorshipDetailsOutletContext {
  mentorship?: MentorshipDetails;
  isLoading: boolean;
  mentorshipId: number;
}

const OverviewSection: FC = () => {
  const { mentorship, isLoading, mentorshipId } = useOutletContext<MentorshipDetailsOutletContext>();
  const navigate = useNavigate();

  const handleSelectMentorship = (id: number) => {
    if (id === mentorshipId) return;
    navigate(`/mentorships/${id}`);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="space-y-8">
        <MentorInfo mentorship={mentorship} isLoading={isLoading} />

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Description</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">About this mentorship</h2>
            </div>
          </div>
          <div className="mt-6 text-base leading-8 text-slate-700">
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

      <aside className="space-y-6">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Quick facts</p>
            <div className="mt-6 grid gap-4">
              <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                <span className="text-sm text-slate-500">Category</span>
                <span className="font-semibold text-slate-900">{isLoading ? '—' : mentorship?.category}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                <span className="text-sm text-slate-500">Status</span>
                <span className="font-semibold text-slate-900">{isLoading ? '—' : mentorship?.status}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                <span className="text-sm text-slate-500">Price</span>
                <span className="font-semibold text-slate-900">{isLoading ? '—' : `$${mentorship?.price}`}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                <span className="text-sm text-slate-500">Discount</span>
                <span className="font-semibold text-slate-900">{isLoading ? '—' : `${mentorship?.discountPercentage}%`}</span>
              </div>
            </div>
          </div>

{/* i will add it when bacj-end add api */}
          {/* <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Need a mentor?</p>
            <div className="mt-6 space-y-3 text-slate-700">
              <p className="text-sm leading-7">
                This mentorship is designed for learners who want a fast track into mastery with a guided mentor and practical curriculum.
              </p>
              <button
                type="button"
                className="lg:w-full rounded-3xl bg-[var(--primary-500)] px-5 py-3
                 text-sm font-semibold text-white  transition hover:bg-[var(--primary-dark)] "
                 >
                Request mentoring call
              </button>
            </div>
          </div> */}
        </div>
      </aside>

      <TopMentorships mentorships={mentorship?.topMentorMentorships} isLoading={isLoading} onSelect={handleSelectMentorship} />
    </div>
  );
};

export default OverviewSection;
