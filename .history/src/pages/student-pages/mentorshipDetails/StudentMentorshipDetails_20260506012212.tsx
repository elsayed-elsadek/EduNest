import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link, Outlet } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useMentorshipDetails } from '../../../services/student-roleService/mentorshipDetails.api';
import HeroSection from './components/HeroSection';
import MentorshipTabsNav from './components/MentorshipTabsNav';
import ProgressSection from './components/ProgressSection';
import UpcomingItemsSection from './components/UpcomingItemsSection';
import type { MentorshipDetails } from '../../../types/student-role-types/studentMentorshipTypes';
import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import Footer from '../../../components/student-components/common/Footer/Footer';

const MentorshipDetailsPage = () => {
  const { mentorshipId } = useParams();
  const navigate = useNavigate();

  // 🔍 DEBUG LOG: Raw ID from URL
  console.log('[DEBUG] Raw mentorshipId from URL:', mentorshipId, typeof mentorshipId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mentorshipId]);

  const normalizedId = Number(mentorshipId ?? '');
  const hasValidId = Number.isFinite(normalizedId) && normalizedId > 0;

  // 🔍 DEBUG LOG: ID parsing result
  console.log('[DEBUG] normalizedId:', normalizedId, 'hasValidId:', hasValidId, 'for raw:', mentorshipId);

  const { data, isLoading, isError, error } = useMentorshipDetails(normalizedId, hasValidId);

  // 🔍 DEBUG LOG: Query status
  console.log('[DEBUG] useMentorshipDetails - isLoading:', isLoading, 'isError:', isError, error?.message);

  const mentorship = useMemo<MentorshipDetails | undefined>(() => data as MentorshipDetails | undefined, [data]);


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

{/* maybe i will add this class later ,,max-w-7xl,, */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link to="/mentorships" className="font-medium text-slate-600 hover:text-slate-900">
                    Mentorships
                  </Link>
                </li>
                <li className="text-slate-400">/</li>
                <li className="text-slate-700">Details</li>
              </ol>
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/mentorships')}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Mentorships
              </button>
            </div>
          </div>
        </div>

        {!hasValidId ? (
          <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <h2 className="text-lg font-semibold">Invalid mentorship ID</h2>
                <p className="mt-1 text-sm text-yellow-900">
                  Please verify the mentorship link or return to the main mentorships page.
                </p>
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <h2 className="text-lg font-semibold">Unable to load mentorship details</h2>
                <p className="mt-1 text-sm text-red-700">
                  {error instanceof Error ? error.message : 'Unexpected error while loading mentorship detail.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-8 lg:space-y-9">
              
              <HeroSection mentorship={mentorship} isLoading={isLoading} mentorshipId={normalizedId} />
              
              {/* Enrolled Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Progress */}
                <ProgressSection />
                
                {/* Upcoming Items */}
                <UpcomingItemsSection />
              </div>
              
              <MentorshipTabsNav />
              <Outlet context={{ mentorship, isLoading, mentorshipId: normalizedId }} />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MentorshipDetailsPage;

