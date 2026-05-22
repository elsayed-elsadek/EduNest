import { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, GraduationCap, Loader2 } from 'lucide-react';
import { useMentorshipDetails } from '../../../services/student-roleService/mentorshipDetails.api';
import { useJoinMentorship } from '../../../services/student-roleService/enrollMentorship';
import type { MentorshipDetails } from '../../../types/student-role-types/studentMentorshipTypes';
import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import Footer from '../../../components/student-components/common/Footer/Footer';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { API_BASE_URL } from '../../../services/api';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);

const EnrollMentorship = () => {
  const { mentorshipId } = useParams<{ mentorshipId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mentorshipId]);

  const normalizedId = Number(mentorshipId ?? '');
  const hasValidId = Number.isFinite(normalizedId) && normalizedId > 0;

  const {
    data: mentorship,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
    error: detailsError,
  } = useMentorshipDetails(normalizedId, hasValidId);

  const joinMutation = useJoinMentorship({
    onSuccess: () => {
      // Auto-navigate to the learning page after a short delay so the user sees the toast
      setTimeout(() => {
        navigate(`/student/learning/${normalizedId}`);
      }, 1500);
    },
  });

  const details = useMemo<MentorshipDetails | undefined>(
    () => mentorship as MentorshipDetails | undefined,
    [mentorship]
  );

  const handleEnroll = () => {
    if (!hasValidId) return;
    joinMutation.mutate(normalizedId);
  };

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------

  if (!hasValidId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold">Invalid mentorship ID</h2>
                <p className="mt-1 text-sm text-yellow-900">
                  Please verify the mentorship link or return to the explore page.
                </p>
                <Link
                  to="/mentorships"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-yellow-800 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Mentorships
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isDetailsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner message="Loading mentorship details..." submessage="Preparing your enrollment" />
        <Footer />
      </div>
    );
  }

  if (isDetailsError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold">Unable to load mentorship</h2>
                <p className="mt-1 text-sm text-red-700">
                  {detailsError instanceof Error ? detailsError.message : 'Unexpected error while loading mentorship details.'}
                </p>
                <Link
                  to="/mentorships"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Mentorships
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/mentorships" className="font-medium text-slate-600 hover:text-slate-900">
                Mentorships
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link
                to={`/mentorships/${normalizedId}`}
                className="font-medium text-slate-600 hover:text-slate-900"
              >
                Details
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-700 font-medium">Enroll</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(`/mentorships/${normalizedId}`)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </button>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">
            Complete Enrollment
          </h1>
          <p className="mt-2 text-slate-500">
            Review the mentorship details below and confirm your enrollment.
          </p>
        </div>

        {/* Success State */}
        {joinMutation.isSuccess && (
          <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold">Enrollment Successful!</h2>
                <p className="mt-1 text-sm text-emerald-800">
                  You have successfully joined the mentorship. Redirecting you to your learning dashboard...
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/student/learning/${normalizedId}`)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:underline"
                >
                  <GraduationCap className="h-4 w-4" />
                  Go to My Learning
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {joinMutation.isError && (
          <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold">Enrollment Failed</h2>
                <p className="mt-1 text-sm text-red-700">
                  {joinMutation.error instanceof Error
                    ? joinMutation.error.message
                    : 'Something went wrong. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Card */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Cover image */}
          <div
            className="h-48 sm:h-64 w-full bg-slate-900 bg-cover bg-center"
            style={{
         backgroundImage: details?.coverImageUrl
  ? `url(${API_BASE_URL}${details.coverImageUrl})`
  : 'none',
            }}
          />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-[var(--primary-500)] text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                  {details?.category ?? 'Mentorship'}
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  {details?.title ?? 'Untitled Mentorship'}
                </h2>
                <p className="text-slate-500">{details?.subtitle}</p>
              </div>

              <div className="text-right sm:min-w-[140px]">
                <p className="text-sm text-slate-400 line-through font-medium">
                  {formatCurrency(details?.price ?? 0)}
                </p>
                <p className="text-3xl font-black text-[var(--primary-500)]">
                  {formatCurrency(details?.finalPrice ?? 0)}
                </p>
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Mentor</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{details?.mentorName}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Duration</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{details?.duration} Months</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Difficulty</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{details?.difficultyLevel}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleEnroll}
                disabled={joinMutation.isPending || joinMutation.isSuccess}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-[var(--primary-500)] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {joinMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enrolling...
                  </>
                ) : joinMutation.isSuccess ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Enrolled
                  </>
                ) : (
                  'Confirm Enrollment'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/mentorships/${normalizedId}`)}
                disabled={joinMutation.isPending}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnrollMentorship;

