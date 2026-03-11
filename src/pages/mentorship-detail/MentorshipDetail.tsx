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

        try {
          const dashResponse = await getFullMentorshipDashboard(
            mentorshipId,
            { reviewsSize: 6, topSize: 3 }
          );

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dash = (dashResponse as any)?.apiResponse?.dashboard;

          if (dash) {
            setStats(dash.stats);
            setTopLearners(dash.topLearners?.content || []);
            setReviews(dash.reviews?.content || []);
            setMentorshipDashboardStudents(dash.studentsRanks?.content || []);
          }
        } catch (e) {
          console.warn('Dashboard fetch failed', e);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load mentorship details';

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    const loadContent = async () => {
      try {
        setContentLoading(true);

        const fetchedWeeks = await getWeeksByMentorship(Number(mentorshipId));

        const weeksData: WeekData[] = await Promise.all(
          fetchedWeeks.map(async (week) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let items: any[] = [];

            try {
              items = await getWeekContents(week.id);

              items.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
              });
            } catch (e) {
              console.warn(`Week ${week.id} failed`, e);
            }

            return { week, items };
          })
        );

        setWeeks(weeksData);
      } catch {
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
          <div className="text-red-500">
            {error || 'Mentorship not found'}
          </div>
        </div>
      </DashLayout>
    );
  }

  const totalLessons = Number(stats?.totalLessons ?? 0);
  const totalQuizzes = Number(stats?.totalQuizzes ?? 0);
  const totalAssignments = Number(stats?.totalAssignments ?? 0);
  const totalSessions = Number(stats?.totalSessions ?? 0);

  const students: Student[] =
    mentorshipDashboardStudents.length > 0
      ? mentorshipDashboardStudents
      : [];

  return (
    <DashLayout pageTitle="My Mentorships / Details">

      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-6">
          <MentorshipHeader
            mentorship={mentorship}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOverviewClick={handleOverviewClick}
            onCreateContentClick={handleCreateContentClick}
          />
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            <MentorshipStatsCards
              totalLessons={totalLessons}
              totalQuizzes={totalQuizzes}
              totalAssignments={totalAssignments}
              totalSessions={totalSessions}
              mentorshipId={mentorshipId || ''}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <MentorshipReviews reviews={reviews} />
              <MentorshipTopLearners topLearners={topLearners} />
            </div>

            <div className="overflow-x-auto">
              <MentorshipStudentsTable students={students} />
            </div>

          </div>
        )}

        {/* Overview */}
        {activeTab === 'overview' && (
          <MentorshipContentList
            weeks={weeks}
            loading={contentLoading}
            error={contentError}
            onCreateContentClick={handleCreateContentClick}
          />
        )}

      </div>
    </DashLayout>
  );
};

export default MentorshipDetail;