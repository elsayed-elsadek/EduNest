import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useMentorshipOverview } from '../../../services/student-roleService/mentorshipOverview.api';
import type { MentorshipOverviewEnrolled } from '../../../types/student-role-types/studentMentorshipTypes';
import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import Footer from '../../../components/student-components/common/Footer/Footer';

const MentorshipOverviewPage = () => {
  const { mentorshipId } = useParams();
  const navigate = useNavigate();

  const normalizedId = Number(mentorshipId ?? '');
  const hasValidId = Number.isFinite(normalizedId) && normalizedId > 0;

  const { data, isLoading, isError, error } = useMentorshipOverview(normalizedId, hasValidId);

  const overview = useMemo<MentorshipOverviewEnrolled | undefined>(
    () => data as MentorshipOverviewEnrolled | undefined,
    [data]
  );

  console.log('[DEBUG] MentorshipOverviewPage - normalizedId:', normalizedId, 'hasValidId:', hasValidId);
  console.log('[DEBUG] MentorshipOverviewPage - isLoading:', isLoading, 'isError:', isError, 'data:', data);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header with back button */}
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* Error States */}
        {!hasValidId ? (
          <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold">Invalid mentorship ID</h2>
                <p className="mt-1 text-sm text-yellow-900">
                  Please verify the mentorship link.
                </p>
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold">Unable to load mentorship overview</h2>
                <p className="mt-1 text-sm text-red-700">
                  {error instanceof Error ? error.message : 'You may not be enrolled in this mentorship.'}
                </p>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : overview ? (
          <>
            {/* Main Content */}
            <div className="space-y-8">
              {/* Header Section */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-blue-400 to-slate-600 overflow-hidden">
                  {overview.coverImageUrl && (
                    <img
                      src={overview.coverImageUrl}
                      alt={overview.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-[var(--primary-500)] text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                          {overview.category}
                        </span>
                        {overview.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h1 className="text-4xl font-bold text-slate-900 mb-2">{overview.title}</h1>
                      <p className="text-lg text-slate-600 mb-4">{overview.subtitle}</p>

                      {/* Mentor Info */}
                      <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                        {overview.mentorProfileImageUrl && (
                          <img
                            src={overview.mentorProfileImageUrl}
                            alt={overview.mentorName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{overview.mentorName}</p>
                          {overview.mentorJobTitle && (
                            <p className="text-sm text-slate-600">{overview.mentorJobTitle}</p>
                          )}
                          {overview.mentorYearsOfExperience > 0 && (
                            <p className="text-sm text-slate-500">
                              {overview.mentorYearsOfExperience} years experience
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What will learn */}
                  {overview.whatWillLearn.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">What you will learn</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {overview.whatWillLearn.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-[var(--primary-500)] font-bold mt-1">✓</span>
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Progress</h2>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                    <span className="text-lg font-bold text-[var(--primary-500)]">
                      {overview.progress.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[var(--primary-500)] h-full rounded-full transition-all duration-300"
                      style={{ width: `${overview.progress.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tasks */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Tasks Completed</p>
                    <p className="text-3xl font-bold text-[var(--primary-500)]">
                      {overview.progress.completedTasks}/{overview.progress.totalTasks}
                    </p>
                  </div>

                  {/* Quizzes */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Quizzes Completed</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {overview.progress.completedQuizzes}/{overview.progress.totalQuizzes}
                    </p>
                  </div>

                  {/* Projects */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Projects Completed</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {overview.progress.completedProjects}/{overview.progress.totalProjects}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upcoming Items */}
              {overview.upcomingItems.content.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Deadlines</h2>

                  <div className="space-y-3">
                    {overview.upcomingItems.content.map((item) => {
                      const dueDate = new Date(item.dueDate);
                      const isOverdue = dueDate < new Date();

                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-[var(--primary-500)] transition"
                        >
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--primary-500)] mt-2" />

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{item.title}</p>
                            <p className="text-sm text-slate-600 mt-1">{item.weekTitle}</p>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded uppercase tracking-wider ${
                                isOverdue
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-[var(--primary-500)]'
                              }`}
                            >
                              {item.type}
                            </span>
                            <p
                              className={`text-xs mt-2 ${
                                isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600'
                              }`}
                            >
                              {dueDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {overview.upcomingItems.totalPages > 1 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                      <p className="text-sm text-slate-600">
                        Showing {overview.upcomingItems.content.length} of{' '}
                        {overview.upcomingItems.totalElements} upcoming items
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      <Footer />
    </div>
  );
};

export default MentorshipOverviewPage;
