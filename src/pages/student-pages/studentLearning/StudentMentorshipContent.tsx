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
import ContentTypeBadge from '../../../components/common/ContentTypeBadge';
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
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  const buildItemKey = (weekId: number, type: string, id: number | string) => `${weekId}-${type}-${id}`;

  const parseItemKey = (itemKey: string) => {
    const [weekIdStr, type, ...idParts] = itemKey.split('-');
    if (!weekIdStr || !type || idParts.length === 0) return null;
    const weekId = Number(weekIdStr);
    const id = Number(idParts.join('-'));
    if (Number.isNaN(weekId) || Number.isNaN(id)) return null;
    return { weekId, type, id };
  };

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
  const locationState = location.state as { weekId?: number | string; itemId?: number | string; itemKey?: string } | null;

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

    const initializeFromLocationState = () => {
      if (locationState?.itemKey) {
        const parsedKey = parseItemKey(locationState.itemKey);
        if (parsedKey) {
          const week = weeks.find(
            (week) => week.weekId === parsedKey.weekId && week.items.some((item) => item.type === parsedKey.type && item.id === parsedKey.id)
          );
          if (week) {
            setSelectedWeekId(week.weekId);
            setSelectedItemKey(buildItemKey(week.weekId, parsedKey.type, parsedKey.id));
            return true;
          }
        }

        const legacyFoundWeek = weeks.find(week => week.items.some(item => `${item.type}-${item.id}` === locationState.itemKey));
        if (legacyFoundWeek) {
          const legacyItem = legacyFoundWeek.items.find(item => `${item.type}-${item.id}` === locationState.itemKey);
          if (legacyItem) {
            setSelectedWeekId(legacyFoundWeek.weekId);
            setSelectedItemKey(buildItemKey(legacyFoundWeek.weekId, legacyItem.type, legacyItem.id));
            return true;
          }
        }
      }

      if (locationState?.itemId != null) {
        const parsedItemId = typeof locationState.itemId === 'string'
          ? Number(locationState.itemId)
          : locationState.itemId;

        const parsedWeekId = typeof locationState.weekId === 'string'
          ? Number(locationState.weekId)
          : locationState.weekId ?? null;

        if (!Number.isNaN(parsedItemId)) {
          if (parsedWeekId != null && !Number.isNaN(parsedWeekId)) {
            const week = weeks.find(w => w.weekId === parsedWeekId);
            const foundItem = week?.items.find(item => item.id === parsedItemId);
            if (week && foundItem) {
              setSelectedWeekId(parsedWeekId);
              setSelectedItemKey(buildItemKey(parsedWeekId, foundItem.type, foundItem.id));
              return true;
            }
          }

          const matchingItems = weeks.flatMap(week =>
            week.items
              .filter(item => item.id === parsedItemId)
              .map(item => ({ weekId: week.weekId, item }))
          );

          if (matchingItems.length === 1) {
            setSelectedWeekId(matchingItems[0].weekId);
            setSelectedItemKey(buildItemKey(matchingItems[0].weekId, matchingItems[0].item.type, matchingItems[0].item.id));
            return true;
          }
        }
      }

      return false;
    };

    if (!initializeFromLocationState()) {
      setSelectedWeekId(weeks[0].weekId);
      setSelectedItemKey(weeks[0].items[0] ? buildItemKey(weeks[0].weekId, weeks[0].items[0].type, weeks[0].items[0].id) : null);
    }
  }, [weeks, locationState?.itemKey, locationState?.weekId, locationState?.itemId]);

  useEffect(() => {
    if (!selectedItemKey) return;
    const parsedKey = parseItemKey(selectedItemKey);
    if (parsedKey && parsedKey.weekId !== selectedWeekId) {
      setSelectedWeekId(parsedKey.weekId);
    }
  }, [selectedItemKey, selectedWeekId]);

  const selectedWeek = useMemo(
    () => weeks.find(w => w.weekId === selectedWeekId) ?? weeks.find(w => w.items.some(item => buildItemKey(w.weekId, item.type, item.id) === selectedItemKey)),
    [weeks, selectedWeekId, selectedItemKey]
  );

  const selectedItem = useMemo(() => {
    if (!selectedItemKey) return null;
    const parsedKey = parseItemKey(selectedItemKey);
    if (parsedKey) {
      const week = weeks.find((w) => w.weekId === parsedKey.weekId);
      return week?.items.find((item) => item.type === parsedKey.type && item.id === parsedKey.id) ?? null;
    }

    for (const week of weeks) {
      const item = week.items.find(i => `${i.type}-${i.id}` === selectedItemKey);
      if (item) return item;
    }
    return null;
  }, [weeks, selectedItemKey]);

  const [contentVisible, setContentVisible] = useState(true);

  useEffect(() => {
    setContentVisible(false);
    const timer = window.setTimeout(() => setContentVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, [selectedItemKey]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <Navbar />
        <main className="mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[350px] space-y-4">
              <div className="h-20 rounded-3xl bg-white shadow-sm border border-gray-200 animate-pulse" />
              <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
                <div className="h-4 rounded-full bg-gray-200 w-2/3 animate-pulse" />
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-12 rounded-2xl bg-gray-200 animate-pulse" />
                ))}
              </div>
              <div className="h-12 rounded-3xl bg-white shadow-sm border border-gray-200 animate-pulse" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-5 rounded-full bg-gray-200 w-32 animate-pulse" />
              <div className="h-10 rounded-2xl bg-gray-200 w-3/4 animate-pulse" />
              <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
                <div className="h-6 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 rounded-full bg-gray-200 w-5/6 animate-pulse" />
                <div className="h-72 rounded-[28px] bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <Navbar />

      {/* max-w-7xl */}
      <main className="mx-auto px-4 py-4 sm:py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <ContentSidebar 
            weeks={weeks} 
            mentorshipId={mentorshipId || ''}
            selectedWeekId={selectedWeekId} 
            selectedItemKey={selectedItemKey} 
            onSelect={(w, i, type) => {
              setSelectedWeekId(w);
              setSelectedItemKey(buildItemKey(w, type, i));
            }} 
          />
          {/* Right Content */}
          <section className="flex-1 min-w-0">
            {selectedItem && selectedWeek ? (
              <div className={`space-y-6 transition-all duration-200 ease-out ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'}`}>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{selectedWeek.weekTitle}</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[var(--primary-500)] font-medium">{selectedItem.title}</span>
                </div>

                {/* Title Section */}
                <div>
                  <div className="flex items-center gap-3">
                    <ContentTypeBadge type={selectedItem.type} size="sm" />
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">{selectedItem.title}</h1>
                  </div>
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
                else if (itemType === 'QUIZ') {
                  return <QuizSubmission quizId={selectedItem.id} />;
                }
                  
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
