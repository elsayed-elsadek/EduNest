
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { BookOpen, BookMarked, BookText, BookDashed, Notebook, NotebookPen, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import DashLayout from '../../../components/layout/Dash-layout';
import ProfileHeader from '../../../components/mentor-components/viewstuudent-profile-com/ProfileHeader';
import StatsCard from '../../../components/mentor-components/viewstuudent-profile-com/StatsCard';
import ContactSection from '../../../components/mentor-components/viewstuudent-profile-com/ContactSection';
import SocialMediaSection from '../../../components/mentor-components/viewstuudent-profile-com/SocialMediaSection';
import EnrolledMentorshipsTable from '../../../components/mentor-components/viewstuudent-profile-com/EnrolledMentorshipsTable';
import ProjectsList from '../../../components/mentor-components/viewstuudent-profile-com/ProjectsList';
import AwardBadgesModal from '../../../components/mentor-components/viewstuudent-profile-com/AwardBadgesModal';
import type { Student, Mentorship, Project, SocialMedia, AwardedBadge } from '../../../types/viewStudent.types';
import { getStudentFullProfile, extractStudentFullProfile } from '../../../services/Studentprofileservice';

const PRIMARY = '#0f5e8b';

// Skeleton 
const ProfileSkeleton: FC = () => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
    <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 h-[650px]" />
    <div className="xl:col-span-2 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />
        ))}
      </div>
      <div className="h-80  bg-white rounded-2xl border border-gray-100" />
      <div className="h-60  bg-white rounded-2xl border border-gray-100" />
    </div>
  </div>
);

//  Fallback icon component + color pools 
const ICON_POOL  = [BookOpen, BookMarked, BookText, BookDashed, Notebook, NotebookPen];
const COLOR_POOL = ['#F59E0B','#3B82F6','#8B5CF6','#10B981','#EF4444','#EC4899'];

//  Page 
const StudentProfile: FC = () => {
  const { id: studentId } = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [loading,        setLoading      ] = useState(true);
  const [error,          setError        ] = useState<string | null>(null);
  const [student,        setStudent      ] = useState<Student       | null>(null);
  const [mentorships,    setMentorships  ] = useState<Mentorship[]>([]);
  const [projects,       setProjects     ] = useState<Project[]>([]);
  const [socialMedia,    setSocialMedia  ] = useState<SocialMedia[]>([]);
  const [awardedBadges,  setAwardedBadges] = useState<AwardedBadge[]>([]);
  const [showBadges,     setShowBadges   ] = useState(false);

  // pagination state
  const [mentorshipsPage,       setMentorshipsPage      ] = useState(0);
  const [mentorshipsTotalPages, setMentorshipsTotalPages ] = useState(1);
  const [projectsPage,          setProjectsPage         ] = useState(0);
  const [projectsTotalPages,    setProjectsTotalPages   ] = useState(1);
  const [projectsTotalElements, setProjectsTotalElements] = useState(0);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProfile = (mPage: number, pPage: number, spinner = true) => {
    if (!studentId) return;
    if (spinner) setLoading(true);
    setError(null);

    getStudentFullProfile(studentId, { mentorshipsPage: mPage, projectsPage: pPage, projectsSize: 1 })
      .then((res) => {
        const profile = extractStudentFullProfile(res);
        if (!profile) { setError('Could not parse student profile.'); return; }
        const { info, mentorships: mData, projects: pData, awardedBadges: aBadges } = profile;

        setStudent({
          id:                   studentId,
          name:                 info.name,
          email:                info.email,
          address:              info.address ?? '',
          avatar:               info.avatar  ?? '',
          coverImage:           info.coverImage ?? '',
          activeMentorships:    info.activeMentorships,
          completedMentorships: info.completedMentorships,
          totalPoints:          info.totalPoints,
        });

        setSocialMedia([
          { platform: 'LinkedIn', username: info.linkedInLink ?? '', url: info.linkedInLink ?? undefined },
          { platform: 'Facebook', username: info.facebookLink ?? '', url: info.facebookLink ?? undefined },
          { platform: 'GitHub',   username: info.githubLink   ?? '', url: info.githubLink   ?? undefined },
        ]);

        setMentorships(
          mData.content.map((m, idx): Mentorship => ({
            id:               String(m.mentorshipId),
            name:             m.title,
            imageUrl:         m.imageUrl,                          // ← real cover from API
            icon:             '',
            iconComponent:    ICON_POOL[idx  % ICON_POOL.length],
            iconColor:        COLOR_POOL[idx % COLOR_POOL.length], // fallback
            startDate:        '',
            totalPoints:      m.totalPoints,
            quizzes:          m.totalQuizzes,
            submittedQuizzes: m.submittedQuizzes,
            assignments:      m.totalTasks,
            submittedTasks:   m.submittedTasks,
            status:           m.status === 'COMPLETED' ? 'Completed' : 'In progress',
          }))
        );
        setMentorshipsTotalPages(mData.totalPages || 1);

        setProjects(
          (pData.content as unknown as Array<{
            id: string | number; title: string; mentorship: string; status: string;
            submissionDate: string; filesCount?: number; feedback?: string;
            submissionLink?: string; gradedAt?: string | null;
            rawScore?: number | null; finalScore?: number | null;
          }>).map((p): Project => ({
            projectSubmissionId: p.id,
            projectTitle:        p.title,
            mentorshipTitle:     p.mentorship,
            status:              p.status as Project['status'],
            submittedAt:         p.submissionDate,
            gradedAt:            p.gradedAt     ?? null,
            submissionLink:      p.submissionLink,
            filesCount:          p.filesCount   ?? 0,
            feedback:            p.feedback     ?? null,
            rawScore:            p.rawScore     ?? null,
            finalScore:          p.finalScore   ?? null,
          }))
        );
        setProjectsTotalPages(pData.totalPages || 1);
        setProjectsTotalElements(pData.totalElements || 0);

        setAwardedBadges(aBadges.map((b): AwardedBadge => ({
          id:              b.id,
          badgeId:         b.badgeId,
          badgeTitle:      b.badgeTitle,
          studentId:       b.studentId,
          studentFullName: b.studentFullName,
          awardedById:     b.awardedById,
          awardedAt:       b.awardedAt,
          note:            b.note,
          badgePoints:     b.badgePoints,
        })));
      })
      .catch((err: unknown) => setError((err as { message?: string })?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isHydrated || !token || !studentId) return;
    fetchProfile(0, 0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token, studentId]);

  const handleMentorshipsPage = (p: number) => { setMentorshipsPage(p); fetchProfile(p, projectsPage, false); };
  const handleProjectsPage    = (p: number) => { setProjectsPage(p);    fetchProfile(mentorshipsPage, p, false); };
  const handleChat = () => {
    if (!student) return;
    navigate('/mentor/messages', { state: { openDirectChatWith: { email: student.email, name: student.name, avatar: student.avatar || undefined } } });
  };

  const earnedBadgeIds = awardedBadges.map(b => b.badgeId);

  if (error) return (
    <DashLayout pageTitle="Students / Profile">
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <p className="text-red-500 font-semibold">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl text-sm text-white" style={{ backgroundColor: PRIMARY }}>
          Retry
        </button>
      </div>
    </DashLayout>
  );

  return (
    <DashLayout pageTitle={student ? `Students / ${student.name}` : 'Students / Profile'}>
      <div className="w-full max-w-[1440px] mx-auto p-4 md:p-6">
        {loading ? <ProfileSkeleton /> : student && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">

            {/* ── Sidebar ── */}
            <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
              <ProfileHeader student={student} onMail={() => { window.location.href = `mailto:${student.email}`; }} onChat={handleChat} />
              <div className="px-6"><hr className="border-gray-50" /></div>
              <ContactSection email={student.email} />
              <div className="px-6"><hr className="border-gray-50" /></div>
              <SocialMediaSection socialMedia={socialMedia} />

              <div className="mt-auto p-6">
                <button
                  onClick={() => setShowBadges(true)}
                  className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 text-white"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Trophy size={16} />
                  Award Badges
                  {awardedBadges.length > 0 && (
                    <span className="ml-1 bg-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: PRIMARY }}>
                      {awardedBadges.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard icon={<BookOpen size={22} className="text-blue-600" />} label="Active Mentorships"    value={student.activeMentorships}               iconBgColor="bg-blue-50" />
                <StatsCard icon={<CheckCircle2 size={22} className="text-emerald-600" />} label="Completed Mentorships" value={student.completedMentorships}            iconBgColor="bg-green-50" />
                <StatsCard icon={<Sparkles size={22} className="text-orange-500" />} label="Total Points"          value={student.totalPoints.toLocaleString()}    iconBgColor="bg-orange-50" />
              </div>

              <EnrolledMentorshipsTable
                mentorships={mentorships}
                currentPage={mentorshipsPage}
                totalPages={mentorshipsTotalPages}
                onPageChange={handleMentorshipsPage}
              />

              <ProjectsList
                projects={projects}
                projectsPage={projectsPage}
                projectsTotalPages={projectsTotalPages}
                projectsTotalCount={projectsTotalElements}
                onProjectsPageChange={handleProjectsPage}
                awardedBadges={awardedBadges}
              />
            </div>
          </div>
        )}
      </div>

      {showBadges && student && (
        <AwardBadgesModal
          studentName={student.name}
          studentId={Number(studentId)}
          mentorships={mentorships.map(m => ({ id: m.id, name: m.name }))}
          earnedBadgeIds={earnedBadgeIds}
          onClose={() => setShowBadges(false)}
          onAwarded={() => fetchProfile(mentorshipsPage, projectsPage, false)}
        />
      )}
    </DashLayout>
  );
};

export default StudentProfile;