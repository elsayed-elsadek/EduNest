import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Clock, MessageCircle, BadgeCheck, Flame } from 'lucide-react';
import type { MentorshipDetails } from '../../../../types/student-role-types/studentMentorshipTypes';
import { API_BASE_URL } from '../../../../services/api';

interface HeroSectionProps {
  mentorship?: MentorshipDetails;
  isLoading?: boolean;
  mentorshipId?: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);

const HeroSection: FC<HeroSectionProps> = ({ mentorship, mentorshipId }) => {
  const navigate = useNavigate();
  const [imageError] = useState(false);

  const discountPercent = mentorship?.price && mentorship?.finalPrice
    ? Math.round(((mentorship.price - mentorship.finalPrice) / mentorship.price) * 100)
    : 0;

  const handleEnroll = () => {
    if (mentorshipId) {
      navigate(`/mentorships/${mentorshipId}/enroll`);
    }
  };

  return (
    <section
      id="overview"
      className="relative min-h-[500px] lg:min-h-[600px] flex items-center overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-900 shadow-2xl"
      style={{
backgroundImage:
  mentorship?.coverImageUrl && !imageError
    ? `url(${Api}${mentorship.coverImageUrl})`
    : 'none',        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'scroll'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-slate-950 via-slate-950/90 lg:via-slate-950/80 to-transparent z-0" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 relative z-10 w-full py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:space-y-8 text-white">
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <span className="px-3 lg:px-4 py-1 bg-[var(--primary-500)] backdrop-blur-md font-semibold rounded-full text-[10px] lg:text-[12px] text-white tracking-[0.15em] lg:tracking-[0.2em] uppercase">
                {mentorship?.category ?? 'Programming'}
              </span>
              <span className="px-3 lg:px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] lg:text-[12px] font-semibold tracking-[0.15em] lg:tracking-[0.2em] uppercase">
                {mentorship?.duration} Months
              </span>
            </div>

            <div className="space-y-3 lg:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight lg:tracking-[0.04em] leading-tight">
                {mentorship?.title}
              </h1>
              <p className="text-lg lg:text-2xl font-medium text-blue-100/80 leading-relaxed max-w-2xl">
                {mentorship?.subtitle}
              </p>
            </div>

            {/* QUICK STATS */}
            <div className="flex flex-wrap gap-4 lg:gap-8 items-center pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                <span className="text-[10px] lg:text-sm font-bold uppercase tracking-widest text-slate-200">{mentorship?.difficultyLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                <span className="text-[10px] lg:text-sm font-bold tracking-widest text-slate-200">{mentorship?.duration} Months </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500 fill-amber-400" />
                <span className="text-[10px] lg:text-sm font-bold tracking-widest text-slate-200">{mentorship?.rating?.toFixed(1) || '4.5'}</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex flex-wrap gap-2 lg:gap-3 mt-4">
                {mentorship?.tags.map((tag) => (
                  <span key={tag} className="px-3 lg:px-4 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] lg:text-[12px] font-semibold tracking-[0.15em] lg:tracking-[0.2em] uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION CARD */}
          <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-6 lg:p-8 shadow-2xl text-slate-900 lg:max-w-md w-full transform hover:scale-[1.01] transition-transform duration-500">
            <div className="flex flex-col gap-5 lg:gap-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tuition Fee</p>
                  <span className="text-xl lg:text-2xl text-slate-300 line-through font-bold">
                    {formatCurrency(mentorship?.price || 0)}
                  </span>
                </div>
                <div className="text-right">
                  {discountPercent > 0 && (
                    <span className="px-2 lg:px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] lg:text-xs font-black tracking-tighter ring-1 ring-red-100">
                      SAVE {discountPercent}%
                    </span>
                  )}
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--primary-500)] mt-1">
                    {formatCurrency(mentorship?.finalPrice || 0)}
                  </p>
                </div>
              </div>

              <div className="p-4 lg:p-5 bg-slate-50 rounded-[1.2rem] lg:rounded-[1.5rem] space-y-3 lg:space-y-4 border border-slate-100">
                <div className="flex items-center gap-3 text-[10px] lg:text-xs font-bold text-slate-600">
                  <BadgeCheck className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />
                  <span>Academic Integrity Certified</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] lg:text-xs text-orange-600 font-bold italic animate-pulse">
                  <Flame className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Cohort starting soon • Limited seats</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:gap-4">
                <button
                  type="button"
                  onClick={handleEnroll}
                  className="w-full px-6 lg:px-8 py-4 lg:py-5 bg-[var(--primary-500)] text-white rounded-xl lg:rounded-2xl font-black text-lg lg:text-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Enroll Now
                </button>
                <button
                  type="button"
                  className="w-full px-6 lg:px-8 py-4 lg:py-5 bg-slate-100 text-slate-700 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  Contact Mentor
                </button>
              </div>

              <p className="text-center text-[9px] lg:text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-widest">
                Secure checkout • 30-Day Guarantee
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;

