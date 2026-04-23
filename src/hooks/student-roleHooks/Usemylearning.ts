
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { getMyLearning, getAchievements } from '../../services/student-roleService/Mylearningservice';
import type {
  Mentorship, LearningStatsData, MentorshipApi,
} from '../../types/student-role-types/learning.types';
import type {
  Badge, ProjectSubmission, BadgeApi, ProjectSubmissionApi, BadgeColor,
} from '../../types/student-role-types/achievement.types';
import api from '../../services/api';

// ── URL builder 
const BASE_URL = (api.defaults.baseURL ?? '')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');

function buildImgUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}

// ── Mentorship mapper 
function mapMentorship(m: MentorshipApi): Mentorship {
  const progress = m.progressPercentage;
  let statusLabel: string;
  let statusType: Mentorship['statusType'];

  if (m.status === 'COMPLETED') {
    statusLabel = 'Completed';
    statusType  = 'UPCOMING';
  } else if (progress >= 80) {
    statusLabel = 'Final stretch';
    statusType  = 'DEADLINE';
  } else if (progress === 0 && m.totalLectures > 0) {
    statusLabel = 'Just started';
    statusType  = 'NEW_CONTENT';
  } else {
    statusLabel = `${progress}% done`;
    statusType  = 'UPCOMING';
  }

  return {
    id:          String(m.mentorshipId),
    title:       m.title,
    subtitle:    m.subtitle ?? '',
    thumbnail:   buildImgUrl(m.coverImageUrl),
    level:       m.difficultyLevel,
    category:    m.category,
    progress:    m.progressPercentage,
    status:      m.status,
    currentWeek: 1,
    statusLabel,
    statusType,
    stats: {
      tasks: { done: m.submittedTasks,    total: m.totalTasks    },
      quiz:  { done: m.submittedQuizzes,  total: m.totalQuizzes  },
      proj:  { done: m.submittedProjects, total: m.totalProjects },
      lect:  { done: 0,                   total: m.totalLectures },
    },
  };
}

// ── Badge mapper 
const BADGE_COLORS: BadgeColor[] = ['blue', 'yellow', 'purple', 'green'];
const BADGE_ICONS = ['🏅', '⚡', '🎯', '👥', '🏆', '🧠', '💡', '🌟'];

function mapBadge(b: BadgeApi, idx: number): Badge {
  return {
    id:              String(b.id),
    title:           b.title,
    description:     b.description || `Awarded for: ${b.mentorshipTitle}`,
    points:          b.points,
    icon:            BADGE_ICONS[idx % BADGE_ICONS.length],
    color:           BADGE_COLORS[idx % BADGE_COLORS.length],
    mentorshipTitle: b.mentorshipTitle,
    awardedBy:       b.awardedByFullName,
    awardedAt:       b.awardedAt,
  };
}

// ── Project mapper 
function mapProject(p: ProjectSubmissionApi): ProjectSubmission {
  const statusMap: Record<string, ProjectSubmission['status']> = {
    GRADED:    'APPROVED',
    SUBMITTED: 'PENDING',
    REJECTED:  'REVISION',
    PENDING:   'PENDING',
  };

  return {
    id:          String(p.id),
    status:      statusMap[p.submissionStatus] ?? 'PENDING',
    category:    p.mentorshipTitle.toUpperCase(),
    title:       p.projectTitle,
    mentorQuote: p.feedback ?? 'No feedback provided yet.',
    mentorName:  p.mentorFullName,
    mentorRole:  'Mentor',
    fileUrl:     p.fileUrl ?? undefined,
  };
}

// ── Query keys 
export const LEARNING_KEYS = {
  stats:        (email: string) =>
                  ['my-learning-stats', email] as const,
  mentorships:  (email: string, page: number, size: number) =>
                  ['my-learning-list', email, page, size] as const,
  achievements: (email: string, bp: number, bs: number, pp: number, ps: number) =>
                  ['achievements', email, bp, bs, pp, ps] as const,
};
// ── useMyLearningStats
export const useMyLearningStats = () => {
  const userEmail = useAuthStore(s => s.userEmail) ?? '';

  const { data, isLoading } = useQuery({
    queryKey:  LEARNING_KEYS.stats(userEmail),
    queryFn:   () => getMyLearning(0, 1000),   
    staleTime: 5 * 60 * 1000,
    gcTime:    20 * 60 * 1000,
    enabled:   !!userEmail,
    select: (res) => {
      const d = res.apiResponse.data;
      const stats: LearningStatsData = {
        completedCount:  d.completedMentorships,
        averageProgress: Math.round(d.averageProgress),
        progressDelta:   0,
        totalPoints:     d.totalPoints,
      };
      return stats;
    },
  });

  return { stats: data, loading: isLoading };
};

// ── useMyLearning — paginated list only ─
export const useMyLearning = (page = 0, size = 10) => {
  const userEmail = useAuthStore(s => s.userEmail) ?? '';

  const { data, isLoading, isError } = useQuery({
    queryKey:  LEARNING_KEYS.mentorships(userEmail, page, size),
    queryFn:   () => getMyLearning(page, size),
    staleTime: 3 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    enabled:   !!userEmail,
    select: (res) => {
      const d = res.apiResponse.data;
      return {
        mentorships:   d.mentorships.content.map(mapMentorship),
        totalPages:    d.mentorships.totalPages,
        totalElements: d.mentorships.totalElements,
      };
    },
  });

  return {
    mentorships:   data?.mentorships    ?? [],
    totalPages:    data?.totalPages     ?? 1,
    totalElements: data?.totalElements  ?? 0,
    loading:       isLoading,
    isError,
  };
};

// ── useAchievements 
export const useAchievements = (
  badgesPage   = 0, badgesSize   = 10,
  projectsPage = 0, projectsSize = 10,
) => {
  const userEmail = useAuthStore(s => s.userEmail) ?? '';

  const { data, isLoading, isError } = useQuery({
    queryKey:  LEARNING_KEYS.achievements(userEmail, badgesPage, badgesSize, projectsPage, projectsSize),
    queryFn:   () => getAchievements(badgesPage, badgesSize, projectsPage, projectsSize),
    staleTime: 5 * 60 * 1000,
    gcTime:    15 * 60 * 1000,
    enabled:   !!userEmail,
    select: (res) => {
      const d = res.apiResponse.data;
      return {
        badges:                d.badges.content.map(mapBadge),
        badgesTotalPages:      d.badges.totalPages,
        badgesTotalElements:   d.badges.totalElements,
        projects:              d.projectSubmissions.content.map(mapProject),
        projectsTotalPages:    d.projectSubmissions.totalPages,
        projectsTotalElements: d.projectSubmissions.totalElements,
      };
    },
  });

  return {
    badges:                data?.badges                ?? [],
    badgesTotalPages:      data?.badgesTotalPages      ?? 1,
    badgesTotalElements:   data?.badgesTotalElements   ?? 0,
    projects:              data?.projects              ?? [],
    projectsTotalPages:    data?.projectsTotalPages    ?? 1,
    projectsTotalElements: data?.projectsTotalElements ?? 0,
    loading:               isLoading,
    isError,
  };
};