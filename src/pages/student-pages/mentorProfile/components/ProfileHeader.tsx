
import { Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MentorProfile } from '../../../../services/student-roleService/mentorProfile.api';
import { API_BASE_URL } from '../../../../services/api';

interface ProfileHeaderProps {
  mentorProfile: MentorProfile | null;
  fullName: string;
  isLoading: boolean;
}

const ProfileHeader = ({ mentorProfile, fullName, isLoading }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  const handleChat = () => {
    if (!mentorProfile?.mentorEmail) return;
    navigate('/student/messages', {
      state: {
        openDirectChatWith: {
          email: mentorProfile.mentorEmail,
          name: fullName,
          avatar: mentorProfile?.mentorProfileImageUrl
            ? `${API_BASE_URL}${mentorProfile.mentorProfileImageUrl}`
            : undefined,
        },
      },
    });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm mb-10">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

        {/* Profile Image */}
        <div className="relative">
          <div className="h-44 w-44 overflow-hidden rounded-3xl bg-slate-100 ring-4 ring-slate-50">
            {isLoading ? (
              <div className="h-full w-full animate-pulse bg-slate-200" />
            ) : (
              <img
                src={`${API_BASE_URL}${mentorProfile?.mentorProfileImageUrl}`}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {fullName}
            </h1>

            {/* ✅ Years of experience — shown only if available */}
            {mentorProfile?.yearsOfExperience != null && mentorProfile.yearsOfExperience > 0 && (
              <p className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <span className="rounded-full bg-[var(--primary-500)]/15 px-3 py-1 text-[var(--primary-700)] font-semibold text-sm ring-1 ring-[var(--primary-500)]/20 shadow-sm">
                  {mentorProfile.yearsOfExperience} years of experience
                </span>
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-10 items-center py-2">
            <div className="grid text-center">
              <p className="text-2xl font-semibold text-slate-900">
                {mentorProfile?.totalLearners?.toLocaleString() ?? '0'}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Total Learners
              </p>
            </div>
            <div className="grid text-center">
              <p className="text-2xl font-semibold text-slate-900">
                {mentorProfile?.totalReviews?.toLocaleString() ?? '0'}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Reviews
              </p>
            </div>
            {/* ✅ Avg Rating stat */}
            {mentorProfile?.avgReviewRate != null && (
              <div className="grid text-center">
                <p className="text-2xl font-semibold text-slate-900">
                  {mentorProfile.avgReviewRate.toFixed(1)}
                </p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Avg Rating
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center md:justify-start gap-3 pt-2">
            <a
              href={mentorProfile?.mentorEmail ? `mailto:${mentorProfile.mentorEmail}` : undefined}
              className="inline-flex items-center gap-2 bg-[var(--primary-500)] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all"
              aria-disabled={!mentorProfile?.mentorEmail}
            >
              <Mail className="w-4 h-4" /> Mail
            </a>
            <button
              type="button"
              onClick={handleChat}
              disabled={!mentorProfile?.mentorEmail}
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" /> Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;