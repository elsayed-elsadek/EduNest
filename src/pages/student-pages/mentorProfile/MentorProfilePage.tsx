import { useEffect, useMemo, useState } from 'react';
import {  useParams } from 'react-router-dom';

import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import Footer from '../../../components/student-components/common/Footer/Footer';
import ProfileHeader from './components/ProfileHeader';
import AboutSection from './components/AboutSection';
import MentorshipsSection from './components/MentorshipsSection';
import ReviewsSection from './components/ReviewsSection';
import ContactSidebar from './components/ContactSidebar';

import { useMentorProfile } from '../../../services/student-roleService/mentorProfile.api';

const MentorProfilePage = () => {
  const { mentorEmail } = useParams();
  const normalizedEmail = mentorEmail ?? '';
  const [mentorshipsPage, setMentorshipsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);

  const { data, isLoading } = useMentorProfile(
    normalizedEmail,
    !!normalizedEmail,
    mentorshipsPage - 1,
    reviewsPage - 1
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMentorshipsPage(1);
    setReviewsPage(1);
  }, [normalizedEmail]);

  const mentorProfile = useMemo(() => data?.mentorProfile ?? null, [data]);
  const mentorships = useMemo(() => data?.mentorships ?? [], [data]);
  const reviews = useMemo(() => data?.reviews ?? [], [data]);
  const mentorshipsTotalPages = data?.mentorshipsPage?.totalPages ?? 1;
  const reviewsTotalPages = data?.reviewsPage?.totalPages ?? 1;
  const totalReviews = mentorProfile?.totalReviews ?? data?.reviewsPage?.totalElements ?? reviews.length;
  const avgReviewRate = mentorProfile?.avgReviewRate ?? null;

  const fullName = `${mentorProfile?.mentorFirstName ?? ''} ${mentorProfile?.mentorLastName ?? ''}`.trim() || 'Mentor';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />


{/* maybe i will add this class later ,,max-w-7xl,, */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProfileHeader mentorProfile={mentorProfile} fullName={fullName} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
          
          {/* Left Column: About & Mentorships */}
          <div className="space-y-12">
            <AboutSection mentorProfile={mentorProfile} />

            <MentorshipsSection
              mentorships={mentorships}
              currentPage={mentorshipsPage}
              totalPages={mentorshipsTotalPages}
              onPageChange={setMentorshipsPage}
              isLoading={isLoading}
            />

            <ReviewsSection
              reviews={reviews}
              totalReviews={totalReviews}
              avgReviewRate={avgReviewRate}
              currentPage={reviewsPage}
              totalPages={reviewsTotalPages}
              onPageChange={setReviewsPage}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Sidebar */}
          <ContactSidebar mentorProfile={mentorProfile} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MentorProfilePage;