
import { type FC, useState, useMemo } from 'react';
import { Mail } from 'lucide-react';
import Navbar               from '../../../components/student-components/common/Navbar/Navbar';
import Footer               from '../../../components/student-components/common/Footer/Footer';
import ProfileHeader        from '../../../components/student-components/studentProfile-com/ProfileHeader/ProfileHeader';
import ScholarlyBio         from '../../../components/student-components/studentProfile-com/ScholarlyBio/ScholarlyBio';
import DomainExpertise      from '../../../components/student-components/studentProfile-com/DomainExpertise/DomainExpertise';
import AcademicAchievements from '../../../components/student-components/studentProfile-com/AcademicAchievements/AcademicAchievements';
import ActiveProjects       from '../../../components/student-components/studentProfile-com/ActiveProjects/ActiveProjects';
import CredentialLedger     from '../../../components/student-components/studentProfile-com/CredentialLedger/CredentialLedger';
import EditProfileModal     from '../../../components/student-components/studentProfile-com/EditProfileModal/EditProfileModal';
import { useStudentProfile } from '../../../hooks/student-roleHooks/Usestudentprofile';
import type { ProfileData } from '../../../types/student-role-types/profile.types';

const BADGES_PER_PAGE   = 3;
const PROJECTS_PER_PAGE = 2;

// ── Skeleton placeholder ──────────────────────────────────────────────────────
const Skeleton: FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const ProfileSkeleton: FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-36 rounded-2xl" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-48" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────
const StudentProfile: FC = () => {
  const {
    profile,
    badges,
    projects,
    credentials,
    loading,
    saving,
    saveProfile,
    uploadImage,
  } = useStudentProfile();

  const [isEditOpen, setIsEditOpen]   = useState(false);
  const [badgePage, setBadgePage]     = useState(1);
  const [projectPage, setProjectPage] = useState(1);

  const badgeTotalPages   = Math.ceil(badges.length / BADGES_PER_PAGE);
  const projectTotalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);

  const paginatedBadges = useMemo(() => {
    const s = (badgePage - 1) * BADGES_PER_PAGE;
    return badges.slice(s, s + BADGES_PER_PAGE);
  }, [badgePage, badges]);

  const paginatedProjects = useMemo(() => {
    const s = (projectPage - 1) * PROJECTS_PER_PAGE;
    return projects.slice(s, s + PROJECTS_PER_PAGE);
  }, [projectPage, projects]);

  const handleSave = (updated: ProfileData) => {
    saveProfile(updated);
    setIsEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Framed container ──────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Top accent strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#0c2d48] via-blue-500 to-blue-300" />

          <div className="p-6 sm:p-8 space-y-6">
            {loading ? (
              <ProfileSkeleton />
            ) : profile ? (
              <>
                {/* Profile Header */}
                <ProfileHeader
                  profile={profile}
                  onEditProfile={() => setIsEditOpen(true)}
                />

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Bio + Expertise */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ScholarlyBio bio={profile.bio} />
                  <DomainExpertise skills={profile.skills} />
                </div>

                {/* Academic Achievements */}
                {badges.length >= 0 && (
                  <AcademicAchievements
                    badges={paginatedBadges}
                    currentPage={badgePage}
                    totalPages={badgeTotalPages}
                    onPageChange={setBadgePage}
                  />
                )}

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Active Projects + Credential Ledger */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <ActiveProjects
                    projects={paginatedProjects}
                    currentPage={projectPage}
                    totalPages={projectTotalPages}
                    onPageChange={setProjectPage}
                  />
                  <CredentialLedger credentials={credentials} />
                </div>
              </>
            ) : (
                <div className="py-20 text-center text-gray-400">
                  <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-gray-400" />
                  </div>
                  <p>Could not load profile. Please refresh.</p>
                </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={isEditOpen}
          profile={profile}
          saving={saving}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSave}
          onImageChange={uploadImage}
        />
      )}
    </div>
  );
};

export default StudentProfile;