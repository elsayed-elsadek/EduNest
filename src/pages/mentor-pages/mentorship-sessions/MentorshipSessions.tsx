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
import Pagination from '../../../components/mentor-components/mentor-dash-com/Pagination/Pagination';

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
            } catch (err: unknown) {
                let message = 'Failed to load sessions';
                
                if (err instanceof Error) {
                    message = err.message;
                } else if (typeof err === 'object' && err !== null) {
                    const error = err as Record<string, unknown>;
                    message = error.message as string || message;
                }
                
                setError(message);
                console.error('Error loading sessions:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, [mentorshipId, token, page, size]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleStartSession = async (sessionId: number) => {
        try {
            setActionLoading(true);
            const info = await startLiveSession(sessionId);
            setActiveSession(info);
            setIsPrejoining(true);
        }  catch (err: unknown) {
    let message = 'Failed to start session';
    
    if (err instanceof Error) {
        message = err.message;
    } else if (typeof err === 'object' && err !== null) {
            const error = err as {
            message?: string;
            errorMessages?: {
                error?: string;
            };
        };
        
        message = error.errorMessages?.error || error.message || message;
    }
    
    toast.error(message);
    setError(message);
}finally {
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

            if (mentorshipId) {
                const data = await getAllLiveSessionsForMentorship(Number(mentorshipId), page, size);
                setSessionsData(data);
            }
        } catch (err: unknown) {
            let message = 'Failed to end session';
            
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'object' && err !== null) {
                const error = err as Record<string, unknown>;
                message = error.message as string || message;
            }
            
            console.error(message);
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
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-[var(--primary-500)]"></div>
                </div>
            </DashLayout>
        );
    }

    if (error && !sessionsData) {
        return (
            <DashLayout pageTitle="Mentorship Sessions">
                <div className="flex flex-col items-center justify-center h-[50vh] px-4">
                    <div className="bg-red-50/60 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-sm">
                        <Video size={20} />
                        <p>{error || 'Failed to find sessions'}</p>
                    </div>
                    <Link to={`/mentor/mentorships/${mentorshipId}`} className="mt-5 flex items-center gap-2 text-xs font-bold text-[var(--primary-500)] hover:opacity-80 transition-all">
                        <ArrowLeft size={14} />
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
                <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
                    {actionLoading && (
                        <div className="fixed inset-0 bg-black/5 z-50 flex items-center justify-center backdrop-blur-xs">
                            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center gap-3 text-sm font-semibold text-gray-700">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[var(--primary-500)]"></div>
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
            <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
                {actionLoading && (
                    <div className="fixed inset-0 bg-black/5 z-50 flex items-center justify-center backdrop-blur-xs">
                        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center gap-3 text-sm font-semibold text-gray-700">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[var(--primary-500)]"></div>
                            <span>Please wait...</span>
                        </div>
                    </div>
                )}
                
                {/* Header Section */}
                <div className="flex flex-col gap-1 mb-6">
                    <div className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-900 transition-colors" onClick={() => window.history.back()}>
                        <ArrowLeft size={20} className="shrink-0" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Live Sessions</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium pl-7">Manage and review all scheduled live sessions</p>
                </div>

                {/* Sessions List Container */}
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
                            <Video className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <h3 className="text-base font-bold text-gray-900">No sessions found</h3>
                            <p className="mt-1 text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">There are no live sessions scheduled for this mentorship yet.</p>
                        </div>
                    ) : (
                        sessions.map((session) => {
                            const { date, time } = formatDateTime(session.sessionStartDate);

                            return (
                                <div
                                    key={session.id}
                                    className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 transition-all duration-200 hover:border-gray-200/80"
                                >
                                    {/* Left side: Video Badge & Titles */}
                                    <div className="flex items-start gap-3.5 min-w-0">
                                        <div className="p-3 rounded-xl bg-[var(--primary-500)] text-white shrink-0 shadow-xs">
                                            <FontAwesomeIcon icon={faVideo} className="text-sm" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base font-bold text-gray-900 truncate pr-2" title={session.title}>
                                                {session.title.length > 25 ? `${session.title.slice(0, 25)}...` : session.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-400 font-medium mt-1">
                                                <div className="flex items-center gap-1 min-w-0">
                                                    <BookOpen size={14} className="text-gray-300 shrink-0" />
                                                    <span className="truncate">{session.mentorshipTitle}</span>
                                                </div>
                                                <div className="hidden md:block w-1 h-1 rounded-full bg-gray-200"></div>
                                                <div className="flex items-center gap-1 min-w-0">
                                                    <Layers size={14} className="text-gray-300 shrink-0" />
                                                    <span className="truncate">{session.weekTitle}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: Meta Info & Actions grouped cleanly */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100 flex-1 sm:flex-initial justify-center">
                                                <Calendar size={13} className="text-[var(--primary-500)]" />
                                                <span>{date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100 flex-1 sm:flex-initial justify-center">
                                                <Clock size={13} className="text-amber-500" />
                                                <span>{time}</span>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleStartSession(session.id)}
                                            disabled={actionLoading}
                                            className="px-4 py-2 text-xs font-bold text-white bg-[var(--primary-500)] hover:opacity-90 active:scale-[0.98] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto w-full text-center"
                                        >
                                            Start Session
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls wrapper */}
                {sessionsData && sessionsData.totalPages > 1 && (
                    <div className="mt-6 flex justify-center sm:justify-end">
                        <Pagination
                            currentPage={page}
                            totalPages={sessionsData.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </DashLayout>
    );
};

export default MentorshipSessions;