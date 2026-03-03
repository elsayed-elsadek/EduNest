import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashLayout from '../../components/layout/Dash-layout';
import {
  getMentorshipDetail,
  getMentorshipStats,
  getTopLearners,
  getMentorshipReviews,
} from '../../services/mentorDashboardService';
import {
  getWeeksByMentorship,
  getWeekContents,
} from '../../services/mentorshipsContent';
import { useAuthStore } from '../../store/authStore';
import type { MentorshipApiResponse } from '../../services/mentorDashboardService';

import type { WeekData, Learner, Review, Student } from './types';
import MentorshipHeader from './components/MentorshipHeader';
import MentorshipStatsCards from './components/MentorshipStatsCards';
import MentorshipReviews from './components/MentorshipReviews';
import MentorshipTopLearners from './components/MentorshipTopLearners';
import MentorshipStudentsTable from './components/MentorshipStudentsTable';
import MentorshipContentList from './components/MentorshipContentList';

const MentorshipDetail: FC = () => {
  const params = useParams<{ mentorshipId?: string; id?: string }>();
  const mentorshipId = params.mentorshipId ?? params.id;
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [mentorship, setMentorship] = useState<MentorshipApiResponse | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [topLearners, setTopLearners] = useState<Learner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard'>('overview');

  const [weeks, setWeeks] = useState<WeekData[] | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!mentorshipId) {
      setError('Mentorship ID not provided');
      setLoading(false);
      return;
    }

    const loadMentorshipDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMentorshipDetail(mentorshipId);
        setMentorship(data);

        // try getting stats, top learners and reviews (fail silently)
        try {
          const s = await getMentorshipStats(mentorshipId);
          setStats(s as Record<string, unknown>);
        } catch (e) {
          console.warn('Could not load mentorship stats', e);
        }

        try {
          const learners = await getTopLearners(String(mentorshipId));
          setTopLearners(Array.isArray(learners) ? learners : []);
        } catch (e) {
          console.warn('Could not load top learners', e);
        }

        try {
          const rev = await getMentorshipReviews(String(mentorshipId));
          setReviews(Array.isArray(rev) ? rev : []);
        } catch (e) {
          console.warn('Could not load reviews', e);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load mentorship details';
        setError(message);
        console.error('Error loading mentorship:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadContent = async () => {
      try {
        setContentLoading(true);
        const fetchedWeeks = await getWeeksByMentorship(Number(mentorshipId));

        // Fetch items for each week
        const weeksData: WeekData[] = await Promise.all(
          fetchedWeeks.map(async (week) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let items: any[] = [];
            try {
              items = await getWeekContents(week.id);
              // Sort items by createdAt
              items.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
                return dateA - dateB; // Ascending order
              });
            } catch (e) {
              console.warn(`Could not load contents for week ${week.id}`, e);
            }
            return { week, items };
          })
        );

        setWeeks(weeksData);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setContentError('Failed to load mentorship content');
      } finally {
        setContentLoading(false);
      }
    };

    loadMentorshipDetail();
    loadContent();
  }, [mentorshipId, token, navigate]);

  const handleCreateContentClick = () => {
    if (!mentorshipId) return;
    navigate(`/mentor/mentorships/${mentorshipId}/content`);
  };

  const handleOverviewClick = () => {
    navigate('/mentor/mentorships');
  };

  if (loading) {
    return (
      <DashLayout pageTitle="Mentorship Details">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashLayout>
    );
  }

  if (error || !mentorship) {
    return (
      <DashLayout pageTitle="Mentorship Details">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500">{error || 'Mentorship not found'}</div>
        </div>
      </DashLayout>
    );
  }

  // derive counts (fallback to stats or mentorship fields)
  const totalLessons = ((stats?.['lessons'] ?? mentorship?.lessonsCount) as number | string | undefined) ?? 0;
  const totalQuizzes = ((stats?.['quizzes'] ?? mentorship?.quizzesCount) as number | string | undefined) ?? 0;
  const totalAssignments = ((stats?.['assignments'] ?? mentorship?.assignmentsCount) as number | string | undefined) ?? 0;
  const totalSessions = ((stats?.['sessions'] ?? mentorship?.sessionsCount) as number | string | undefined) ?? 0;

  const mentorshipRecord = mentorship as unknown as Record<string, unknown> | null;
  const rawStudents = (mentorshipRecord?.students ?? mentorshipRecord?.enrolledUsers) as unknown;
  const students: Student[] = Array.isArray(rawStudents) ? (rawStudents as Student[]) : [];

  return (
    <DashLayout pageTitle="My Mentorships / Details">
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-start gap-6 mb-6">
          <div className="flex-1">
            <MentorshipHeader
              mentorship={mentorship}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOverviewClick={handleOverviewClick}
              onCreateContentClick={handleCreateContentClick}
            />

            {/* Dashboard / Stats View */}
            {activeTab === 'dashboard' && (
              <>
                <MentorshipStatsCards
                  totalLessons={totalLessons}
                  totalQuizzes={totalQuizzes}
                  totalAssignments={totalAssignments}
                  totalSessions={totalSessions}
                />

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <MentorshipReviews reviews={reviews} />
                  <MentorshipTopLearners topLearners={topLearners} />
                </div>

                <MentorshipStudentsTable students={students} />
              </>
            )}

            {/* Mentorship Content View */}
            {activeTab === 'overview' && (
              <MentorshipContentList
                weeks={weeks}
                loading={contentLoading}
                error={contentError}
                onCreateContentClick={handleCreateContentClick}
              />
            )}
          </div>
        </div>
      </div>
    </DashLayout>
  );
};

export default MentorshipDetail;



