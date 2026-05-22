
import { type FC, useState, useMemo } from 'react';
import { BookOpen, Award, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar            from '../../../components/student-components/common/Navbar/Navbar';
import Footer            from '../../../components/student-components/common/Footer/Footer';
import LearningTabs      from '../../../components/student-components/my-learning-com/LearningTabs/LearningTabs';
import StatsCards        from '../../../components/student-components/my-learning-com/StatsCards/StatsCards';
import ActiveMentorships from '../../../components/student-components/my-learning-com/ActiveMentorships/ActiveMentorships';
import Pagination        from '../../../components/student-components/common/Pagination/Pagination';
import BadgesSection     from '../../../components/student-components/my-learning-com/achievement/BadgesSection/BadgesSection';
import ProjectsSection   from '../../../components/student-components/my-learning-com/achievement/ProjectsSection/ProjectsSection';
import CertificationTab  from '../../../components/student-components/my-learning-com/Certificationtab/Certificationtab';
import { useMyLearning, useMyLearningStats, useAchievements } from '../../../hooks/student-roleHooks/Usemylearning';
import { useCertificates } from '../../../hooks/student-roleHooks/Usecertificates';
import type { TabKey } from '../../../types/student-role-types/learning.types';

const MENTORSHIPS_PER_PAGE = 3;
const BADGES_PER_PAGE      = 3;
const PROJECTS_PER_PAGE    = 2;
const CERTS_PER_PAGE       = 5;

const Skel: FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const MyLearning: FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('enrollment');

  // Stats — always total counts, unaffected by list pagination
  const { stats, loading: statsLoading } = useMyLearningStats();

  // Enrollment list
  const [enrollPage, setEnrollPage] = useState(0);
  const learning = useMyLearning(enrollPage, MENTORSHIPS_PER_PAGE);

  // Achievement
  const [badgePage,   setBadgePage]   = useState(0);
  const [projectPage, setProjectPage] = useState(0);
  const achievements = useAchievements(
    badgePage, BADGES_PER_PAGE, projectPage, PROJECTS_PER_PAGE,
  );

  // Certification
  const [certPage, setCertPage] = useState(0);
  const certs = useCertificates(certPage, CERTS_PER_PAGE);

  // Client-side smart pagination for badges/projects
  const displayedBadges = useMemo(() => {
    if (achievements.badgesTotalPages <= 1 && achievements.badges.length > BADGES_PER_PAGE)
      return achievements.badges.slice(badgePage * BADGES_PER_PAGE, (badgePage + 1) * BADGES_PER_PAGE);
    return achievements.badges;
  }, [achievements.badges, achievements.badgesTotalPages, badgePage]);

  const badgeTotalPagesDisplay = useMemo(() => {
    if (achievements.badgesTotalPages <= 1 && achievements.badges.length > BADGES_PER_PAGE)
      return Math.ceil(achievements.badges.length / BADGES_PER_PAGE);
    return achievements.badgesTotalPages;
  }, [achievements.badges.length, achievements.badgesTotalPages]);

  const displayedProjects = useMemo(() => {
    if (achievements.projectsTotalPages <= 1 && achievements.projects.length > PROJECTS_PER_PAGE)
      return achievements.projects.slice(projectPage * PROJECTS_PER_PAGE, (projectPage + 1) * PROJECTS_PER_PAGE);
    return achievements.projects;
  }, [achievements.projects, achievements.projectsTotalPages, projectPage]);

  const projectTotalPagesDisplay = useMemo(() => {
    if (achievements.projectsTotalPages <= 1 && achievements.projects.length > PROJECTS_PER_PAGE)
      return Math.ceil(achievements.projects.length / PROJECTS_PER_PAGE);
    return achievements.projectsTotalPages;
  }, [achievements.projects.length, achievements.projectsTotalPages]);

  const navigate = useNavigate();

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setEnrollPage(0); setBadgePage(0); setProjectPage(0); setCertPage(0);
  };

  const enrollPageUi    = enrollPage + 1;
  const enrollTotalPage = learning.totalPages || 1;

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <LearningTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* ══════════ ENROLLMENT ══════════ */}
        {activeTab === 'enrollment' && (
          <>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
              <p className="text-sm text-gray-500 mt-1">Track your mentorships, progress, and points in one place.</p>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Skel key={i} className="h-24" />)}
              </div>
            ) : stats ? (
              <StatsCards data={stats} />
            ) : null}

            {learning.loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => <Skel key={i} className="h-48" />)}
              </div>
            ) : learning.mentorships.length > 0 ? (
              <ActiveMentorships
                mentorships={learning.mentorships}
                onContinue={(id) => navigate(`/student/learning/${id}`)}
                onPrevSlide={() => setEnrollPage(p => Math.max(0, p - 1))}
                onNextSlide={() => setEnrollPage(p => Math.min(enrollTotalPage - 1, p + 1))}
                canGoPrev={enrollPage > 0}
                canGoNext={enrollPage < enrollTotalPage - 1}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <BookOpen className="mx-auto mb-3 h-14 w-14 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No active mentorships</h3>
                <p className="text-sm text-gray-400">Enroll in a mentorship to get started.</p>
              </div>
            )}

            {enrollTotalPage > 1 && (
              <Pagination currentPage={enrollPageUi} totalPages={enrollTotalPage} onPageChange={p => setEnrollPage(p - 1)} />
            )}
          </>
        )}

        {/* ══════════ ACHIEVEMENT ══════════ */}
        {activeTab === 'achievement' && (
          <>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Academic Milestones</h1>
              <p className="text-sm text-gray-500 mt-2 max-w-lg leading-relaxed">
                Your journey toward intellectual excellence is measured through consistent progress and high-impact project execution.
              </p>
            </div>

            {achievements.loading ? (
              <div className="flex gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Skel key={i} className="flex-1 h-44" />)}
              </div>
            ) : achievements.badges.length > 0 ? (
              <BadgesSection badges={displayedBadges} currentPage={badgePage + 1} totalPages={badgeTotalPagesDisplay}
                onPrev={() => setBadgePage(p => Math.max(0, p - 1))}
                onNext={() => setBadgePage(p => Math.min(badgeTotalPagesDisplay - 1, p + 1))} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <Award className="mx-auto mb-2 h-12 w-12 text-yellow-500" />
                <p className="text-sm text-gray-400">No badges earned yet. Keep going!</p>
              </div>
            )}

            {achievements.loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => <Skel key={i} className="h-40" />)}
              </div>
            ) : achievements.projects.length > 0 ? (
              <>
                <ProjectsSection projects={displayedProjects} currentPage={projectPage + 1} totalPages={projectTotalPagesDisplay}
                  onPageChange={p => setProjectPage(p - 1)} />
                {projectTotalPagesDisplay > 1 && (
                  <Pagination currentPage={projectPage + 1} totalPages={projectTotalPagesDisplay} onPageChange={p => setProjectPage(p - 1)} />
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <ClipboardList className="mx-auto mb-2 h-12 w-12 text-slate-400" />
                <p className="text-sm text-gray-400">No project submissions yet.</p>
              </div>
            )}
          </>
        )}

        {/* ══════════ CERTIFICATION ══════════ */}
        {activeTab === 'certification' && (
          <CertificationTab
            certificates={certs.certificates}
            loading={certs.loading}
            currentPage={certPage + 1}
            totalPages={certs.totalPages}
            totalElements={certs.totalElements}
            pageSize={CERTS_PER_PAGE}
            onPageChange={p => setCertPage(p - 1)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyLearning;