
import type { FC }    from 'react';
import { useRef }     from 'react';
import { BookOpen, AlertTriangle }   from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar           from '../../../components/student-components/common/Navbar/Navbar';
import Footer           from '../../../components/student-components/common/Footer/Footer';
import HeroSection      from '../../../components/student-components/StudentDashboard-com/HeroSection/HeroSection';
import ContinueLearning from '../../../components/student-components/StudentDashboard-com/ContinueLearning/ContinueLearning';
import Timeline         from '../../../components/student-components/StudentDashboard-com/Timeline/Timeline';
import RecommendedCourses from '../../../components/student-components/StudentDashboard-com/RecommendedCourses/RecommendedCourses';
import Testimonials     from '../../../components/student-components/StudentDashboard-com/Testimonials/Testimonials';
import CTASection       from '../../../components/student-components/StudentDashboard-com/CTASection/CTASection';
import { useHomepage }  from '../../../hooks/student-roleHooks/Usehomepage';
import type { Testimonial } from '../../../types/student-role-types/testimonial.types';

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1', name: 'Marcus Thomas', role: 'Master of Business', company: 'EasyPay',
    avatar: 'https://i.pravatar.cc/150?img=12', rating: 5,
    content: 'The job placement mentorship at EduNest triggered the transition from a junior designer to a lead role. The curriculum is incredibly practical.',
  },
  {
    id: '2', name: 'Elora Venus', role: 'Director of Learning', company: 'Tasker',
    avatar: 'https://i.pravatar.cc/150?img=45', rating: 5,
    content: "All of my daily struggles that I'm experiencing in the workplace now, they teach systems thinking and creative problem solving.",
  },
  {
    id: '3', name: 'Jordan Black', role: 'Full Stack Developer',
    avatar: 'https://i.pravatar.cc/150?img=33', rating: 5,
    content: "The community support is what sets this platform apart! I've built a global network of peers that I still collaborate with on a weekly basis.",
  },
];

const StudentDashboard: FC = () => {
  const navigate     = useNavigate();
  const timelineRef  = useRef<HTMLDivElement>(null);

  const { continueLearning, recommended, timelineEvents, stats, loading, error } = useHomepage();

  const averageProgress = continueLearning.length > 0
    ? continueLearning.reduce((sum, c) => sum + c.progress, 0) / continueLearning.length
    : 0;

  const handleSchedule = () => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResume = () => {
    navigate('/student/learning');
  };

  const handleResumeCourse = (id: string) => {
    navigate(`/student/learning/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <Navbar />

      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm font-medium">
            <AlertTriangle className="inline w-4 h-4 mr-2 text-red-600 align-middle" /> {error}
          </div>
        )}

        {/* Hero */}
        <HeroSection
          stats={stats}
          timelineEvents={timelineEvents}
          averageProgress={averageProgress}
          loading={loading}
          onResume={handleResume}
          onSchedule={handleSchedule}
        />

        {/* Continue Learning + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : continueLearning.length > 0 ? (
              <ContinueLearning
                courses={continueLearning}
                onResumeCourse={handleResumeCourse}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <BookOpen className="mx-auto mb-3 h-14 w-14 text-blue-500" />
                <p className="font-semibold text-gray-700">No active courses yet</p>
                <p className="text-sm text-gray-400 mt-1">Enroll in a mentorship to get started</p>
              </div>
            )}
          </div>

          {/* ── Timeline مع الـ ref */}
          <div className="lg:col-span-1" ref={timelineRef}>
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 h-72 animate-pulse" />
            ) : (
              <Timeline events={timelineEvents} />
            )}
          </div>
        </div>

        {/* Recommended */}
        {!loading && recommended.length > 0 && (
          <RecommendedCourses
            courses={recommended}
            onAddToCart={id => console.log('Enroll:', id)}
          />
        )}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="h-6 w-56 bg-gray-200 rounded animate-pulse" />
            <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        )}

        <Testimonials testimonials={TESTIMONIALS} />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;