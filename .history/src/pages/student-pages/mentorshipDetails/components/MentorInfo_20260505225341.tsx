import type { FC } from 'react';
import { Briefcase, Mail,  ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MentorshipDetails } from '../../../../types/student-role-types/studentMentorshipTypes';

interface MentorInfoProps {
  mentorship?: MentorshipDetails;
  isLoading?: boolean;
}

const MentorInfo: FC<MentorInfoProps> = ({ mentorship, isLoading = false }) => {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row items-center ">
        <div className="h-32 w-32 overflow-hidden rounded-3xl bg-slate-100">
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-gray-200 rounded-full" />
          ) : mentorship?.mentorProfileImageUrl ? (
            <img
              src={mentorship.mentorProfileImageUrl}
              alt={mentorship.mentorName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-slate-600">
              <span className="text-3xl font-bold">{mentorship?.mentorName?.charAt(0) ?? 'M'}</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-6 space-y-2 lg:space-y-0 items-center ">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Lead mentor</p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {isLoading ? <span className="inline-block h-7 w-56 rounded bg-gray-200 animate-pulse" /> : mentorship?.mentorName}
              </h2>
              <p className="text-sm text-gray-500">
                {isLoading ? <span className="inline-block h-5 w-48 rounded bg-gray-200 animate-pulse" /> : mentorship?.mentorJobTitle}
              </p>
            </div>
            {isLoading ? (
              <div className="h-10 w-40 rounded bg-gray-200 animate-pulse shrink-0" />
            ) : mentorship?.mentorEmail ? (
              <Link
                to={`/mentor-profile/${encodeURIComponent(mentorship.mentorEmail)}`}
                className="inline-flex items-center gap-2 rounded-3xl bg-[var(--primary-500)] px-5 py-2.5 text-sm font-semibold
                 text-white transition-all hover:bg-[var(--primary-dark)] hover:shadow-lg shrink-0 "
              >
                View Mentor Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 cursor-not-allowed shrink-0"
              >
                Profile unavailable
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* i will add it when backend puts it */}
            {/* <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 text-slate-500">
                <Users className="h-4 w-4" />
                <span>Mentorships</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900">{isLoading ? '—' : '12+'}</p>
            </div> */}
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 text-slate-500">
                <Briefcase className="h-4 w-4" />
                <span>Experience</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {isLoading ? '—' : `${mentorship?.mentorYearsOfExperience ?? 0} yrs`}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>

              {/* split the email into name and domain */}
             <p className="mt-2 text-lg font-semibold text-slate-900 break-words">
  {isLoading
    ? '—'
    : (mentorship?.mentorEmail?.split('@')[0] || 'Not shared')}
</p>

<p className="mt-1 text-sm text-slate-500">
  {mentorship?.mentorEmail?.includes('@')
    ? `@${mentorship.mentorEmail.split('@')[1]}`
    : ''}
</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorInfo;
