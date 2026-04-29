
import { useState, useEffect, useCallback } from 'react';
import { getFullHomepage, extractHomepageData } from '../../services/student-roleService/Homepageservice';
import { useAuthStore } from '../../store/authStore';
import type {
  ContinueLearningDto,
  RecommendedMentorshipDto,
  UpcomingItemDto,
  DashboardStats,
} from '../../types/student-role-types/student-home-page.types';
import type { Course, TimelineEvent } from '../../types/student-role-types/course.types';


const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const resolveImg = (url: string | null | undefined): string =>
  url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : '';

// mappers 
const mapContinueLearning = (dto: ContinueLearningDto): Course => ({
  id:         String(dto.mentorshipId),
  title:      dto.title,
  instructor: dto.mentorName,
  thumbnail:  resolveImg(dto.coverImageUrl),
  progress:   dto.progressPercentage,
  status:     'IN_PROGRESS',
  category:   'Mentorship',
  rating:     0,
  price:      0,
  level:      'INTERMEDIATE',
});

const mapRecommended = (dto: RecommendedMentorshipDto): Course => {
  const discounted = dto.price * (1 - dto.discountPercentage / 100);
  return {
    id:            String(dto.id),
    title:         dto.title,
    instructor:    dto.mentorName,
    thumbnail:     resolveImg(dto.coverImageUrl),
    progress:      0,
    status:        'NEW',
    category:      dto.difficultyLevel,
    rating:        0,
    price:         parseFloat(discounted.toFixed(2)),
    originalPrice: dto.price,
    discount:      dto.discountPercentage,
    level:         dto.difficultyLevel === 'ALL_LEVEL' ? 'BEGINNER' : dto.difficultyLevel,
  };
};

const mapTimelineEvent = (dto: UpcomingItemDto): TimelineEvent & { mentorshipId: number } => ({
  id:           String(dto.id),
  type:         dto.type as TimelineEvent['type'],
  title:        dto.title,
  description:  dto.description,
  time:         dto.dueDate
    ? new Date(dto.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : dto.startTime
      ? new Date(dto.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : '',
  // store raw ISO for relative formatting in Timeline
  date:         dto.dueDate ?? dto.startTime ?? '',
  status:       dto.status as TimelineEvent['status'],
  icon:         '',
  mentorshipId: (dto as { mentorshipId?: number }).mentorshipId ?? 0,
});

//  stats from items 
const computeStats = (items: UpcomingItemDto[]): DashboardStats => ({
  mentorshipSessions: items.filter(i => i.type === 'SESSION').length,
  projectDeadlines:   items.filter(i => i.type === 'PROJECT').length,
  assignments:        items.filter(i => i.type === 'TASK').length,
  totalUpcoming:      items.length,
});

// ── hook ──────────────────────────────────────────────────────────────────────
export interface UseHomepageReturn {
  continueLearning: Course[];
  recommended:      Course[];
  timelineEvents:   (TimelineEvent & { mentorshipId: number })[];
  stats:            DashboardStats;
  loading:          boolean;
  error:            string | null;
  refetch:          () => void;
}

export const useHomepage = (): UseHomepageReturn => {
  const token      = useAuthStore(s => s.token);
  const isHydrated = useAuthStore(s => s.isHydrated);

  const [continueLearning, setContinueLearning] = useState<Course[]>([]);
  const [recommended,      setRecommended]      = useState<Course[]>([]);
  const [timelineEvents,   setTimelineEvents]   = useState<(TimelineEvent & { mentorshipId: number })[]>([]);
  const [stats,            setStats]            = useState<DashboardStats>({
    mentorshipSessions: 0, projectDeadlines: 0, assignments: 0, totalUpcoming: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token || !isHydrated) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await getFullHomepage();
      const data = extractHomepageData(res);

      setContinueLearning(data.continueLearning.map(mapContinueLearning));
      setRecommended(data.recommendedMentorships.map(mapRecommended));
      setTimelineEvents(data.upcomingItems.map(mapTimelineEvent));
      setStats(computeStats(data.upcomingItems));
    } catch (e: unknown) {
      setError(typeof e === 'string' ? e : 'Failed to load homepage data');
    } finally {
      setLoading(false);
    }
  }, [token, isHydrated]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { continueLearning, recommended, timelineEvents, stats, loading, error, refetch: fetchData };
};