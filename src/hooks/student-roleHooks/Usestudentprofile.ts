
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import {
  getStudentProfile,
  updateStudentProfile,
  updateStudentProfileImage,
} from '../../services/student-roleService/Studentprofileservice';
import type {
  StudentProfileApi,
  ProfileData,
  AchievementBadge,
  ActiveProject,
  CredentialEntry,
  ProfileCertificateApi,
} from '../../types/student-role-types/profile.types';
import api from '../../services/api';

// ── helpers

const BASE_URL = (api.defaults.baseURL ?? '').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

function buildImgUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}

function mapProfile(raw: StudentProfileApi): ProfileData {
  return {
    id:          raw.email || '',
    firstName:   raw.firstName || '',
    lastName:    raw.lastName || '',
    role:        raw.jobTitle || '',
    email:       raw.email || '',
    avatar:      buildImgUrl(raw.profileImageUrl),
    bio:         raw.bio || '',
    skills:      Array.isArray(raw.skills) ? raw.skills : [],
    githubUrl:   raw.githubLink || undefined,
    linkedinUrl: raw.linkedInLink || undefined,
  };
}

function mapBadges(raw: StudentProfileApi): AchievementBadge[] {
  if (!Array.isArray(raw.badges)) {
    console.warn('Badges data is not an array:', raw.badges);
    return [];
  }

  return raw.badges.map(b => ({
    id:              String(b?.id || 'unknown'),
    title:           b?.title || 'Unknown Badge',
    description:     b?.description || '',
    points:          b?.points || 0,
    awardedBy:       b?.awardedByFullName || 'Unknown',
    mentorshipTitle: b?.mentorshipTitle || '',
    awardedAt:       b?.awardedAt || '',
    icon:            '🏅',
    unlocked:        true,
  }));
}

function mapProjects(raw: StudentProfileApi): ActiveProject[] {
  if (!Array.isArray(raw.projects)) {
    console.warn('Projects data is not an array:', raw.projects);
    return [];
  }

  return raw.projects.map(p => ({
    id:             String(p?.projectSubmissionId || 'unknown'),
    title:          p?.projectTitle || 'Unknown Project',
    mentorship:     p?.mentorshipTitle || 'Unknown Mentorship',
    completion:     ['SUBMITTED', 'GRADED', 'APPROVED'].includes(p?.status) ? 100
                  : p?.status === 'IN_PROGRESS' ? 60
                  : p?.status === 'PENDING' ? 10
                  : 0,
    status:         p?.status || 'PENDING',
    submissionLink: p?.submissionLink || undefined,
  }));
}

function mapCredentials(raw: StudentProfileApi): CredentialEntry[] {
  // Handle both direct array and object with content property
  const certsArray = Array.isArray(raw.certificates)
    ? raw.certificates
    : (raw.certificates as { content?: ProfileCertificateApi[] })?.content || [];

  if (!Array.isArray(certsArray)) {
    console.warn('Certificates data is not in expected format:', raw.certificates);
    return [];
  }

  return certsArray.map((c, i) => ({
    id:          `cert-${i}`,
    type:        'Standard Certificate',
    mentorship:  c?.mentorshipTitle || 'Unknown Mentorship',
    rank:        `RANK ${c?.rank || 'N/A'}`,
    issuedAt:    c?.issuedAt,
    mentorName:  c?.mentorFullName || 'Unknown Mentor',
  }));
}

// ── Query key
export const STUDENT_PROFILE_KEY = 'student-profile';

// ── Hook 
export const useStudentProfile = () => {
  const userEmail    = useAuthStore(s => s.userEmail);
  const queryClient  = useQueryClient();

  // ── Fetch 
  const { data, isLoading, isError } = useQuery({
    queryKey:  [STUDENT_PROFILE_KEY, userEmail],
    queryFn:   getStudentProfile,
    staleTime: 5 * 60 * 1000,   // 5 min — won't refetch unless stale
    gcTime:    10 * 60 * 1000,  // 10 min in cache after unmount
    enabled:   !!userEmail,
    select: (res) => {
      try {
        const raw = res.apiResponse?.profile;
        if (!raw) {
          console.warn('No profile data in API response');
          return undefined;
        }

        return {
          profile:     mapProfile(raw),
          badges:      mapBadges(raw),
          projects:    mapProjects(raw),
          credentials: mapCredentials(raw),
        };
      } catch (error) {
        console.error('Error mapping profile data:', error);
        return undefined;
      }
    },
  });

  // ── Update profile info 
  const updateMutation = useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_PROFILE_KEY, userEmail] });
      toast.success('Profile updated successfully');
    },
    onError: (e: unknown) => {
      const err = e as { errorMessages?: { error?: string }; message?: string };
      const msg = err?.errorMessages?.error ?? err?.message ?? 'Failed to update profile';
      toast.error(String(msg));
    },
  });

  // ── Upload image
  const imageMutation = useMutation({
    mutationFn: updateStudentProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_PROFILE_KEY, userEmail] });
      toast.success('Profile image updated');
    },
    onError: () => toast.error('Failed to update image'),
  });

  // ── Public save function 
  const saveProfile = (profileData: ProfileData) => {
    const links: Array<{ name: 'GITHUB' | 'LINKEDIN'; url: string }> = [];
    if (profileData.githubUrl?.trim())
      links.push({ name: 'GITHUB',   url: profileData.githubUrl });
    if (profileData.linkedinUrl?.trim())
      links.push({ name: 'LINKEDIN', url: profileData.linkedinUrl });

    updateMutation.mutate({
      firstName:        profileData.firstName,
      lastName:         profileData.lastName,
      bio:              profileData.bio,
      jobTitle:         profileData.role,
      socialMediaLinks: links,
      skills:           profileData.skills,
    });
  };

  return {
    profile:       data?.profile,
    badges:        data?.badges      ?? [],
    projects:      data?.projects    ?? [],
    credentials:   data?.credentials ?? [],
    loading:       isLoading,
    isError,
    saving:        updateMutation.isPending,
    uploadingImage: imageMutation.isPending,
    saveProfile,
    uploadImage:   (file: File) => imageMutation.mutate(file),
  };
};