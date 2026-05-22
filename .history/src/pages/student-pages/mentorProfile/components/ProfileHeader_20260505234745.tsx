import { Mail, MessageSquare } from 'lucide-react';
import type { MentorProfile } from '../../../../services/student-roleService/mentorProfile.api';
import { API_BASE_URL } from '../../../../services/api';

interface ProfileHeaderProps {
  mentorProfile: MentorProfile | null;
  fullName: string;
  isLoading: boolean;
}

// Profile Header Section
const ProfileHeader = ({ mentorProfile, fullName, isLoading }: ProfileHeaderProps) => {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm mb-10">
      {/* 1. items-center: Center items horizontally on mobile 
          2. md:items-start: Align to start on medium screens and up
      */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        
        {/* Profile Image Wrapper */}
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
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--primary-500)] text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
            Verified Expert
          </div>
        </div>

        {/* Content Section - text-center for mobile, md:text-left for desktop */}
        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {fullName}
            </h1>
            
            {/* experience need update from backend */}
            {/* <p className="text-[var(--primary-600)] font-medium mt-1">
              5+ years of experience in web development
            </p> */}
          </div>

          {/* Stats Section - justify-center for mobile */}
          <div className="flex justify-center md:justify-start gap-10 items-center py-2">
            <div className='grid text-center'>
              <p className="text-2xl font-semibold text-slate-900">
                {mentorProfile?.totalLearners?.toLocaleString() ?? '0'}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Total Learners
              </p>
            </div>
            <div className='grid text-center'>
              <p className="text-2xl font-semibold text-slate-900">
                {mentorProfile?.totalReviews?.toLocaleString() ?? '0'}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Reviews
              </p>
            </div>
          </div>

          {/* Action Buttons - justify-center for mobile */}
          <div className="flex justify-center md:justify-start gap-3 pt-2">
            <a
              href={mentorProfile?.mentorEmail ? `mailto:${mentorProfile.mentorEmail}` : undefined}
              className="inline-flex items-center gap-2 bg-[var(--primary-500)] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all"
              aria-disabled={!mentorProfile?.mentorEmail}
            >
              <Mail className="w-4 h-4" /> Mail
            </a>
            <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition-all">
              <MessageSquare className="w-4 h-4" /> Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;