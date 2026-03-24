import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import { getMentorDashboard, type MentorDashboardParams, type MentorDashboardResponse } from '../../../../services/mentorDashboardService';
import { isApiErrorResponse, extractCardsData, mapSessions, mapReviews, mapRevenueChart, mapNotifications } from '../utils/mappers';
import type { DashboardCardsData } from '../types';
import type { Session } from '../../../../components/mentor-components/mentor-dash-com/ScheduledSessions/ScheduledSessions.types';
import type { Review } from '../../../../components/mentor-components/mentor-dash-com/Reviews/Reviews.types';
import type { SalesData } from '../../../../components/mentor-components/mentor-dash-com/SalesChart/SalesChart.types';
import type { Notification } from '../../../../types/mentornotification.types';

export const useDashboardData = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<DashboardCardsData | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [revenueData, setRevenueData] = useState<SalesData[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = useAuthStore((s) => s.token);
    const isHydrated = useAuthStore((s) => s.isHydrated);
    const logout = useAuthStore((s) => s.logout);
    const userName = useAuthStore((s) => s.userName);
    const displayName = userName?.trim().split(/\s+/)[0] || userName || 'Mentor';
    const welcomeDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentToken = useAuthStore.getState().token;
            if (!currentToken) {
                navigate('/login');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [navigate]);

    useEffect(() => {
        if (!isHydrated || token) {
            return;
        }
        if (!token) {
            navigate('/login');
            return;
        }
    }, [isHydrated, token, navigate]);

    useEffect(() => {
        if (!isHydrated || !token) {
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const params: MentorDashboardParams = {
            reviewPage: 1,
            reviewSize: 6,
            sessionPage: 0,
            sessionSize: 5,
            notificationPage: 0,
            notificationSize: 3,
        };

        type AnyDashboard = MentorDashboardResponse & { dashboard?: unknown; data?: unknown };

        interface ErrorLike {
            message?: string;
            error?: string;
        }
        function isErrorLike(o: unknown): o is ErrorLike {
            return typeof o === 'object' && o !== null && ('message' in o || 'error' in o);
        }

        function getErrorMessage(e: unknown): string {
            if (!e) return 'Failed to load dashboard';
            if (typeof e === 'string') return e;
            if (isErrorLike(e)) {
                if (typeof e.message === 'string' && e.message.length > 0) return e.message;
                if (typeof e.error === 'string' && e.error.length > 0) return e.error;
            }
            return 'Failed to load dashboard';
        }

        getMentorDashboard(params)
            .then((res) => {
                if (cancelled) return;

                if (!res || typeof res !== 'object') {
                    throw new Error('Unexpected dashboard response');
                }

                if (isApiErrorResponse(res)) {
                    throw res;
                }

                const r = res as AnyDashboard;
                const apiError = isApiErrorResponse(r.data) ? r.data : null;
                if (apiError) {
                    throw apiError;
                }

                const dashboardObj = r.apiResponse?.dashboard ?? r.dashboard ?? {};

                const extracted = extractCardsData(dashboardObj);
                setCards(extracted);

                const dashObj = dashboardObj as Record<string, unknown>;

                const mappedSessions = mapSessions(dashObj.sessions);
                console.log('✅ Sessions mapped:', mappedSessions.length, 'sessions');
                setSessions(mappedSessions);

                const mappedReviews = mapReviews(dashObj.reviews);
                console.log('✅ Reviews mapped:', mappedReviews.length, 'reviews');
                setReviews(mappedReviews);

                const mapped = mapRevenueChart(dashObj.salesChart);
                console.log('✅ Revenue chart mapped:', mapped.length, 'points');
                setRevenueData(mapped.length > 0 ? mapped : []);

                const mappedNotis = mapNotifications(dashObj.notifications);
                console.log('🔔 Notifications mapped:', mappedNotis.length);
                setNotifications(mappedNotis);

                setLoading(false);
            })
            .catch((err) => {
                if (!cancelled) {
                    const message = getErrorMessage(err);
                    setError(message);
                    if (/invalid jwt|jwt token|unauthorized/i.test(message)) {
                        logout();
                        navigate('/login');
                    }
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [token, navigate, logout, isHydrated]);

    return {
        cards,
        sessions,
        reviews,
        revenueData,
        notifications,
        loading,
        error,
        isHydrated,
        displayName,
        welcomeDate,
    };
};
