import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import Footer from '../../../components/student-components/common/Footer/Footer';
import { useMentorshipContent, useWeekContent } from '../../../services/student-roleService/mentorshipDetails.api';
import { joinLiveSession } from '../../../services/student-roleService/liveSession.api';
import ContentSidebar from './components/ContentSidebar';
import ContentHero from './components/JoinLiveSession';
import AssignmentSubmission from './assimentSubmission/AssignmentSubmission';
import ProjectSubmission from './projectSubmission/ProjectSubmission';
import LectureSection from './components/LectureSection';
import QuizSubmission from './components/QuizSubmission';
import type { Week, WeekContent } from '../../../types/student-role-types/studentMentorshipTypes';

const StudentMentorshipContent = () => {
  const { mentorshipId, weekId } = useParams<{ mentorshipId: string; weekId?: string }>();
  const normalizedWeekId = weekId ? Number(weekId) : null;
  const isWeekView = !!normalizedWeekId && normalizedWeekId > 0;
  
  const mentorshipQuery = useMentorshipContent(mentorshipId || '');
  const weekQuery = useWeekContent(normalizedWeekId || 0, isWeekView);
  
  const data = isWeekView ? (weekQuery.data as WeekContent | undefined) : (mentorshipQuery.data as { weeks: Week[] } | undefined);
  const isLoading = isWeekView ? weekQuery.isLoading : mentorshipQuery.isLoading;

  
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinSession = async (sessionId: number) => {
    setIsJoining(true);
    try {
      const data = await joinLiveSession(sessionId);
      if (data.apiResponse && data.apiResponse['Joined session successfully']) {
        const url = data.apiResponse['Joined session successfully'].meetingUrl;
        setMeetingUrl(url);
        setShowIframe(true);
        toast.success('Session joined successfully!');
      } else {
        toast.error('Failed to join session. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error joining session:', error);
      const err = error as {
        response?: {
          data?: {
            errorMessages?: {
              error?: string;
            };
          };
        };
      };
      const errorMessage = err.response?.data?.errorMessages?.error || 'Error joining session. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCloseSession = () => {
    setShowIframe(false);
    setMeetingUrl('');
    toast.success('Session closed successfully!');
  };

  const location = useLocation();
  const locationState = location.state as { weekId?: number; itemId?: number } | null;

  const weeks: Week[] = useMemo(() => {
    if (isWeekView && data) {
      // Single week view - wrap in array
      return [{ weekId: (data as WeekContent).weekId, weekTitle: (data as WeekContent).weekTitle, items: (data as WeekContent).items }];
    }
    if (data && 'weeks' in data) {
      return data.weeks;
    }
    return [];
  }, [data, isWeekView]);

  useEffect(() => {
    if (weeks.length === 0) return;

    if (locationState?.weekId != null && locationState?.itemId != null) {
      setSelectedWeekId(locationState.weekId);
      setSelectedItemId(locationState.itemId);
      return;
    }

    if (selectedWeekId === null) {
      setSelectedWeekId(weeks[0].weekId);
      setSelectedItemId(weeks[0].items[0]?.id ?? null);
    }
  }, [weeks, selectedWeekId, locationState?.weekId, locationState?.itemId]);

  const selectedWeek = useMemo(() => weeks.find(w => w.weekId === selectedWeekId), [weeks, selectedWeekId]);
  const selectedItem = useMemo(() => selectedWeek?.items.find(i => i.id === selectedItemId), [selectedWeek, selectedItemId]);

  if (isLoading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <Navbar />

      {/* max-w-7xl */}
      <main className="mx-auto px-4 py-4 sm:py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <ContentSidebar 
            weeks={weeks} 
<<<<<<< HEAD
=======
            mentorshipId={mentorshipId || ''}
>>>>>>> Student-role
            selectedWeekId={selectedWeekId} 
            selectedItemId={selectedItemId} 
            onSelect={(w, i) => { setSelectedWeekId(w); setSelectedItemId(i); }} 
          />
          {/* Right Content */}
          <section className="flex-1 min-w-0">
            {selectedItem && selectedWeek ? (
              <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{selectedWeek.weekTitle}</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[var(--primary-500)] font-medium">{selectedItem.title}</span>
                </div>

                {/* Title Section */}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">{selectedItem.title}</h1>
                  <p className="mt-3 sm:mt-4 text-slate-600 text-sm sm:text-base max-w-3xl">
                    {(() => {
                      const itemType = selectedItem.type.toUpperCase();
                      if (itemType === 'ASSIGNMENT' || itemType === 'PROJECT') {
                        return `Submit your ${itemType.toLowerCase()} by uploading a file or providing an external URL.`;
                      } else if (itemType === 'QUIZ') {
                        return 'Take this quiz to test your knowledge and understanding.';
                      } else if (itemType.includes('SESSION') || itemType.includes('LIVE')) {
                        return 'Ask, discuss, and master—join our live sessions for direct mentorship.';
                      } else {
                        return `Content for ${selectedItem.type}.`;
                      }
                    })()}
                  </p>
                </div>

                {/* Content Section */}
                {(() => {
                  const itemType = selectedItem.type.toUpperCase();
                  
                  if (itemType === 'TASK' || itemType === 'ASSIGNMENT') {
                    return <AssignmentSubmission taskId={selectedItem.id} />;
                  } else if (itemType === 'PROJECT') {
                    return <ProjectSubmission projectId={selectedItem.id} />;
                  }
<<<<<<< HEAD
                //   when add quiz api
                // else if (itemType === 'QUIZ') {
                //     return (
                //       <div className="bg-white rounded-3xl p-6 shadow-lg">
                //         <h3 className="text-xl font-bold text-slate-900 mb-4">Quiz</h3>
                //         <p className="text-slate-600 mb-4">Take this quiz to test your knowledge.</p>
                //         <button className="bg-[var(--primary-500)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 rounded-xl font-medium">
                //           Start Quiz
                //         </button>
                //       </div>
                //     );
                //   }
=======
                else if (itemType === 'QUIZ') {
                  return <QuizSubmission quizId={selectedItem.id} />;
                }
>>>>>>> Student-role
                  
                  else if (itemType.includes('LECTURE')) {
                    return <LectureSection lectureId={selectedItem.id} fallbackTitle={selectedItem.title} />;
                  }
                  
                  else if (itemType.includes('SESSION') || itemType.includes('LIVE')) {
                    return (
                      <ContentHero 
                        item={selectedItem} 
                        onJoinSession={handleJoinSession}
                        onCloseSession={handleCloseSession}
                        showIframe={showIframe}
                        meetingUrl={meetingUrl}
                        isJoining={isJoining}
                      />
                    );
                  } else {
                    return (
                      <div className="bg-white rounded-3xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{selectedItem.type}</h3>
                        <p className="text-slate-600">Content for {selectedItem.type} will be displayed here.</p>
                      </div>
                    );
                  }
                })()}
              </div>
            ) : weeks.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white rounded-3xl text-slate-500 p-6 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Content Available</h3>
                <p className="text-slate-500 max-w-sm">
                  There is no content available for this mentorship program yet. Please check back later.
                </p>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                Please select a lesson to begin.
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentMentorshipContent;
