import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashLayout from '../../components/layout/Dash-layout';
import {
  getMentorshipDetail,
  getFullMentorshipDashboard,
} from '../../services/mentorDashboardService';
import type { MentorshipStats } from '../../services/mentorDashboardService';
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
  const [stats, setStats] = useState<MentorshipStats | null>(null);
  const [topLearners, setTopLearners] = useState<Learner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard'>('overview');
  const [mentorshipDashboardStudents, setMentorshipDashboardStudents] = useState<Student[]>([]);

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

        // get unified dashboard data
        try {
          const dashResponse = await getFullMentorshipDashboard(mentorshipId, { reviewsSize: 6, topSize: 3 });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dash = (dashResponse as any)?.apiResponse?.dashboard;
          if (dash) {
            setStats(dash.stats as MentorshipStats);
            setTopLearners((dash.topLearners?.content || []) as Learner[]);
            setReviews((dash.reviews?.content || []) as Review[]);
            setMentorshipDashboardStudents((dash.studentsRanks?.content || []) as Student[]);
          }
        } catch (e) {
          console.warn('Could not load unified mentorship dashboard stats', e);
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
  const totalLessons = Number(stats?.totalLessons ?? (mentorship as any)?.lessonsCount ?? 0) || 0;
  const totalQuizzes = Number(stats?.totalQuizzes ?? (mentorship as any)?.quizzesCount ?? 0) || 0;
  const totalAssignments = Number(stats?.totalAssignments ?? (mentorship as any)?.assignmentsCount ?? 0) || 0;
  const totalSessions = Number(stats?.totalSessions ?? (mentorship as any)?.sessionsCount ?? 0) || 0;

  const mentorshipRecord = mentorship as unknown as Record<string, unknown> | null;
  const rawStudents = (mentorshipRecord?.students ?? mentorshipRecord?.enrolledUsers) as unknown;
  const students: Student[] = mentorshipDashboardStudents.length > 0
    ? mentorshipDashboardStudents
    : Array.isArray(rawStudents)
      ? (rawStudents as Student[])
      : [];

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
                  mentorshipId={mentorshipId || ''}
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



