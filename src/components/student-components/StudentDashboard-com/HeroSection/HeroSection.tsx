
import type { FC } from 'react';
import {
  PlayCircle, Calendar,
  Target, Rocket, Trophy, Sparkles,
} from 'lucide-react';
import { useAuthStore }  from '../../../../store/authStore';
import { useHomeImages } from '../../../../hooks/useHomeImages';
import { theme }         from '../../../../theme/colors';
import type { DashboardStats } from '../../../../types/student-role-types/student-home-page.types';
import type { TimelineEvent }  from '../../../../types/student-role-types/course.types';
interface HeroSectionProps {
  stats:            DashboardStats;
  timelineEvents:   TimelineEvent[];
  averageProgress?: number;
  loading?:         boolean;
  onResume?:        () => void;
  onSchedule?:      () => void;
}

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 0 && h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Build the smart sentence from actual API types (SESSION / TASK / PROJECT / QUIZ)
const buildSmartSentence = (events: TimelineEvent[]): React.ReactNode => {
  if (events.length === 0) {
    return (
      <>
        You're all caught up this week. Keep up the great work!{' '}
        <Trophy className="inline w-5 h-5 text-yellow-300" />
      </>
    );
  }

  const counts: Record<string, number> = {};
  events.forEach(e => { counts[e.type] = (counts[e.type] ?? 0) + 1; });

  const parts: string[] = [];
  if (counts['SESSION'])  parts.push(`${counts['SESSION']} session${counts['SESSION'] !== 1 ? 's' : ''}`);
  if (counts['TASK'])     parts.push(`${counts['TASK']} task${counts['TASK'] !== 1 ? 's' : ''}`);
  if (counts['PROJECT'])  parts.push(`${counts['PROJECT']} project deadline${counts['PROJECT'] !== 1 ? 's' : ''}`);
  if (counts['QUIZ'])     parts.push(`${counts['QUIZ']} quiz${counts['QUIZ'] !== 1 ? 'zes' : ''}`);
  // legacy keys
  if (counts['MENTORSHIP']) parts.push(`${counts['MENTORSHIP']} mentorship session${counts['MENTORSHIP'] !== 1 ? 's' : ''}`);
  if (counts['ASSIGNMENT']) parts.push(`${counts['ASSIGNMENT']} assignment${counts['ASSIGNMENT'] !== 1 ? 's' : ''}`);

  if (parts.length === 0) {
    return (
      <>
        Ready to continue your journey today. Let's go!{' '}
        <Rocket className="inline w-5 h-5 text-blue-300" />
      </>
    );
  }

  return (
    <>
      Ready to continue? You have{' '}
      {parts.map((p, i) => (
        <span key={i}>
          <span className="font-bold text-white">{p}</span>
          {i < parts.length - 2 && ', '}
          {i === parts.length - 2 && ' and '}
        </span>
      ))}{' '}this week.
    </>
  );
};

const HeroSection: FC<HeroSectionProps> = ({
  timelineEvents,
  averageProgress,
  loading = false,
  onResume,
  onSchedule,
}) => {
  const img       = useHomeImages();
  const userName  = useAuthStore(s => s.userName) || 'Student';
  const firstName = userName.trim().split(/\s+/)[0];
  const greeting  = getGreeting();
  const progress  = averageProgress ?? 0;

  return (
    <div
      className="rounded-3xl p-8 md:p-12 relative overflow-hidden"
      style={{ background: theme.gradients?.studentHero ?? 'linear-gradient(135deg, #0c2d48 0%, #1a4d7a 100%)' }}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize:  '32px 32px',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* ── Left ── */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Active Student Portal
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {greeting},<br />{firstName}.
          </h1>

          <p className="text-gray-300 text-base mb-8 leading-relaxed">
            {loading ? (
              <span className="flex flex-col gap-2">
                <span className="h-4 w-3/4 bg-white/10 rounded animate-pulse block" />
                <span className="h-4 w-1/2 bg-white/10 rounded animate-pulse block" />
              </span>
            ) : (
              buildSmartSentence(timelineEvents)
            )}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-500,#2563eb)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/30"
            >
              <PlayCircle className="w-5 h-5" />
              Resume Learning
            </button>

            <button
              onClick={onSchedule}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              <Calendar className="w-5 h-5" />
              View Schedule
            </button>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {img.img1 ? (
              <img
                src={img.img1}
                alt="Student learning"
                className="w-full h-auto object-cover"
                onError={e => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-white/5 rounded-2xl flex items-center justify-center">
                <span className="text-white/40 text-sm">Loading…</span>
              </div>
            )}
          </div>

          {/* Progress card — bottom left */}
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl ring-1 ring-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Progress</p>
                {loading ? (
                  <div className="h-5 w-10 bg-gray-200 rounded animate-pulse mt-0.5" />
                ) : (
                  <p className="text-xl font-bold text-gray-900">
                    {progress >= 0 ? `${Math.round(progress)}%` : '—'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;