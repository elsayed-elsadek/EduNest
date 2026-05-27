import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Video, ArrowLeft, Calendar, Clock, BookOpen, Layers } from 'lucide-react';
import DashLayout from '../../../components/layout/Dash-layout';
import { getAllLiveSessionsForMentorship, startLiveSession, endLiveSession, type LiveSession, type MentorshipPaginatedItems, type LiveSessionInfo } from '../../../services/mentorshipsContent/liveSession';
import LiveSessionPrejoin from './components/LiveSessionPrejoin';
import JitsiMeetingFrame from './components/JitsiMeetingFrame';
import { useAuthStore } from '../../../store/authStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const MentorshipSessions: FC = () => {
    const { id: mentorshipId } = useParams<{ id: string }>();
    const token = useAuthStore((s) => s.token);

    const [sessionsData, setSessionsData] = useState<MentorshipPaginatedItems<LiveSession> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // View state
    const [activeSession, setActiveSession] = useState<LiveSessionInfo | null>(null);
    const [isPrejoining, setIsPrejoining] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const size = 5;

    useEffect(() => {
        if (!token) return;

        const loadSessions = async () => {
            if (!mentorshipId) return;

            try {
                setLoading(true);
                setError(null);

                const data = await getAllLiveSessionsForMentorship(Number(mentorshipId), page, size);
                setSessionsData(data);

            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load sessions';
                setError(message);
                console.error('Error loading sessions:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, [mentorshipId, token, page, size]);

    const handleNextPage = () => {
        if (sessionsData && page < sessionsData.totalPages - 1) {
            setPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage((prev) => prev - 1);
        }
    };

    const handleStartSession = async (sessionId: number) => {
        try {
            setActionLoading(true);
            const info = await startLiveSession(sessionId);
            setActiveSession(info);
            setIsPrejoining(true);
        } catch (err: any) {
            const message = err?.errorMessages?.error || err?.message || 'Failed to start session';
            toast.error(message);
            setError(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmJoin = () => {
        setIsPrejoining(false);
    };

    const handleCancelPrejoin = () => {
        setActiveSession(null);
        setIsPrejoining(false);
    };

    const handleEndSession = async () => {
        if (!activeSession) return;
        try {
            setActionLoading(true);
            await endLiveSession(activeSession.sessionId);
            setActiveSession(null);

            // Reload sessions list
            if (mentorshipId) {
                const data = await getAllLiveSessionsForMentorship(Number(mentorshipId), page, size);
                setSessionsData(data);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to end session';
            console.error(message);
            // Handle force close locally even if error thrown depending on API resilience
            setActiveSession(null);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (loading && !sessionsData) {
        return (
            <DashLayout pageTitle="Mentorship Sessions">
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashLayout>
        );
    }

    if (error && !sessionsData) {
        return (
            <DashLayout pageTitle="Mentorship Sessions">
                <div className="flex flex-col items-center justify-center h-[50vh] px-4">
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                        <Video size={24} />
                        <p>{error || 'Failed to find sessions'}</p>
                    </div>
                    <Link to={`/mentor/mentorships/${mentorshipId}`} className="mt-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Mentorship
                    </Link>
                </div>
            </DashLayout>
        );
    }

    const sessions = sessionsData?.content || [];

    if (activeSession) {
        return (
            <DashLayout pageTitle={`Session: ${activeSession.sessionTitle}`}>
                <div className="px-6 py-6 max-w-5xl mx-auto">
                    {actionLoading && (
                        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
                            <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span>Processing...</span>
                            </div>
                        </div>
                    )}

                    {isPrejoining ? (
                        <LiveSessionPrejoin
                            sessionInfo={activeSession}
                            onJoin={handleConfirmJoin}
                            onCancel={handleCancelPrejoin}
                        />
                    ) : (
                        <JitsiMeetingFrame
                            meetingUrl={activeSession.meetingUrl}
                            onEndSession={handleEndSession}
                        />
                    )}
                </div>
            </DashLayout>
        );
    }

    return (
        <DashLayout pageTitle="Total Sessions">
            <div className="px-6 py-6 max-w-5xl mx-auto">
                {actionLoading && (
                    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span>Please wait...</span>
                        </div>
                    </div>
                )}
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <div className="flex items-baseline gap-2 cursor-pointer text-gray-600 hover:text-gray-900" onClick={() => window.history.back()}>
                      <ArrowLeft size={20} />
                      <h1 className="text-3xl font-bold text-gray-900">Live Sessions</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Manage and review all live sessions</p>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                            <Video className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No sessions found</h3>
                            <p className="mt-1 text-gray-500">There are no live sessions scheduled for this mentorship yet.</p>
                        </div>
                    ) : (
                        sessions.map((session) => {
                            const { date, time } = formatDateTime(session.sessionStartDate);

                            return (
                                <div
                                    key={session.id}
                                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3   rounded-xl bg-[#0A6C17] group-hover:text-white transition-colors">
                                            <FontAwesomeIcon icon={faVideo} className='text-white ' />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.title.slice(0,25)}
                                                   {session.title.length>10 ? "..." : ""}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen size={16} className="text-gray-400" />
                                                    {session.mentorshipTitle}
                                                </div>
                                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Layers size={16} className="text-gray-400" />
                                                    {session.weekTitle}
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    <div className="flex flex-row items-center md:items-end  gap-4 md:gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex-wrap m-auto">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg w-full md:w-auto justify-center">
                                            <Calendar size={16} className="text-blue-500" />
                                            {date}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg w-full md:w-auto justify-center">
                                            <Clock size={16} className="text-amber-500" />
                                            {time}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStartSession(session.id)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg bg-primary transition-colors disabled:opacity-50"
                                    >
                                        Start Session
                                    </button>

                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {sessionsData && sessionsData.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-end px-6 py-4 ">
                        {/* <span className="text-sm text-gray-500 font-medium">
                           Showing {sessions.length} items in this page 
                        </span> */}

                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 0}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 shadow-sm border border-gray-500 rounded-lg hover:bg-[var(--primary-500)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={page >= sessionsData.totalPages - 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border shadow-sm border-gray-500 rounded-lg hover:bg-[var(--primary-500)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashLayout>
    );
};

export default MentorshipSessions;
