
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import DashLayout from '../../components/layout/Dash-layout';
import ProfileHeader from '../../components/viewstuudent-profile-com/ProfileHeader';
import StatsCard from '../../components/viewstuudent-profile-com/StatsCard';
import ContactSection from '../../components/viewstuudent-profile-com/ContactSection';
import SocialMediaSection from '../../components/viewstuudent-profile-com/SocialMediaSection';
import EnrolledMentorshipsTable from '../../components/viewstuudent-profile-com/EnrolledMentorshipsTable';
import ProjectsList from '../../components/viewstuudent-profile-com/ProjectsList';
import type { Student, Mentorship, Project, SocialMedia } from '../../types/viewStudent.types';
import {
  getStudentFullProfile,
  extractStudentFullProfile,
} from '../../services/Studentprofileservice';

//  Skeleton 
const ProfileSkeleton: FC = () => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
    <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 h-[650px]" />
    <div className="xl:col-span-2 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />
        ))}
      </div>
      <div className="h-80 bg-white rounded-2xl border border-gray-100" />
      <div className="h-60 bg-white rounded-2xl border border-gray-100" />
    </div>
  </div>
);

// Component 
const StudentProfile: FC = () => {
  const { id: studentId } = useParams<{ id: string }>();
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [loading,     setLoading    ] = useState(true);
  const [error,       setError      ] = useState<string | null>(null);
  const [student,     setStudent    ] = useState<Student    | null>(null);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [projects,    setProjects   ] = useState<Project[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);

  useEffect(() => {
    if (!isHydrated || !token || !studentId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getStudentFullProfile(studentId)
      .then((res) => {
        if (cancelled) return;

        const profile = extractStudentFullProfile(res);
        if (!profile) { setError("Could not parse student profile data."); return; }

        const { info, mentorships: mPage, projects: pPage } = profile;

        // ── 1. Student ───────────────────────────────────────────────────────
        setStudent({
          id:                   studentId,
          name:                 info.name,
          email:                info.email,
          address:              info.address    ?? "Address not set",
          avatar:               info.avatar     ?? "",
          coverImage:           info.coverImage ?? "",
          activeMentorships:    info.activeMentorships,
          completedMentorships: info.completedMentorships,
          totalPoints:          info.totalPoints,
        });

        // ── 2. Social media
       
        const socials: SocialMedia[] = [
          {
            platform: "LinkedIn",
            username: info.linkedInLink ?? "",
            url:      info.linkedInLink ?? undefined,
          },
          {
            platform: "Facebook",
            username: info.facebookLink ?? "",
            url:      info.facebookLink ?? undefined,
          },
          {
            platform: "GitHub",
            username: info.githubLink ?? "",
            url:      info.githubLink ?? undefined,
          },
        ];
        setSocialMedia(socials);

        //  Mentorships 
        const iconPool  = ["📚","📘","📙","📕","📗"];
        const colorPool = ["#F59E0B","#3B82F6","#8B5CF6","#10B981","#EF4444"];
        setMentorships(
          mPage.content.map((m, idx): Mentorship => ({
            id:               String(m.mentorshipId),
            name:             m.title,
            icon:             iconPool[idx  % iconPool.length],
            iconColor:        colorPool[idx % colorPool.length],
            startDate:        "",
            totalPoints:      m.totalPoints,
            quizzes:          m.totalQuizzes,
            submittedQuizzes: m.submittedQuizzes,
            assignments:      m.totalTasks,
            submittedTasks:   m.submittedTasks,
            status:           m.status === "COMPLETED" ? "Completed" : "In progress",
          }))
        );

        //  Projects
        const rawProjects = pPage.content as unknown as Array<{
          id:             string | number;
          title:          string;
          mentorship:     string;
          status:         string;
          submissionDate: string;
          filesCount?:    number;
          feedback?:      string;
          submissionLink?: string;
          gradedAt?:      string | null;
          rawScore?:      number | null;
          finalScore?:    number | null;
        }>;

        setProjects(
          rawProjects.map((p): Project => ({
            projectSubmissionId: p.id,
            projectTitle:        p.title,
            mentorshipTitle:     p.mentorship,
            // ✅ status كما هو من الـ API
            status:              p.status as Project["status"],
            submittedAt:         p.submissionDate,
            gradedAt:            p.gradedAt   ?? null,
            submissionLink:      p.submissionLink,
            filesCount:          p.filesCount ?? 0,
            feedback:            p.feedback   ?? null,
            rawScore:            p.rawScore   ?? null,
            finalScore:          p.finalScore ?? null,
          }))
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) setError((err as { message?: string })?.message ?? "Failed to load");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isHydrated, token, studentId]);

  if (error) return (
    <DashLayout pageTitle="Students / Profile">
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <p className="text-red-500 font-semibold">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition">
          Retry
        </button>
      </div>
    </DashLayout>
  );

  return (
    <DashLayout pageTitle={student ? `Students / ${student.name}` : "Students / Profile"}>
      <div className="w-full max-w-[1440px] mx-auto p-4 md:p-6">
        {loading ? <ProfileSkeleton /> : student && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">

            {/* Left Column */}
            <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
              <ProfileHeader
                student={student}
                onMail={() => { window.location.href = `mailto:${student.email}`; }}
                onChat={() => {}}
              />
              <div className="px-6"><hr className="border-gray-50" /></div>
              <ContactSection email={student.email} address={student.address} />
              <div className="px-6"><hr className="border-gray-50" /></div>
              <SocialMediaSection socialMedia={socialMedia} />
              <div className="mt-auto p-6">
                <button className="w-full py-3 bg-[#f0f7ff] text-[#e89d1a] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#e6effc] transition-colors">
                  <span>🏆</span> Award badges
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  icon={<div className="w-6 h-6 flex items-center justify-center">📚</div>}
                  label="Active Mentorship" value={student.activeMentorships} iconBgColor="bg-blue-50"
                />
                
                <StatsCard
                  icon={<div className="w-6 h-6 flex items-center justify-center">✅</div>}
                  label="Completed Mentorship" value={student.completedMentorships} iconBgColor="bg-green-50"
                />
                <StatsCard
                  icon={<div className="w-6 h-6 flex items-center justify-center">✨</div>}
                  label="Total Points" value={student.totalPoints.toLocaleString()} iconBgColor="bg-orange-50"
                />
              </div>
              <EnrolledMentorshipsTable mentorships={mentorships} />
              <ProjectsList projects={projects} badgesCount={0} />
            </div>
          </div>
        )}
      </div>
    </DashLayout>
  );
};

export default StudentProfile;