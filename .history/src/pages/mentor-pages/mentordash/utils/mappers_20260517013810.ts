import {
    extractRevenueChartData,
    extractSessionsData,
    extractReviewsData,
    extractNotificationsData,
} from '../../../../services/mentorDashboardService';
import type { Notification } from '../../../../types/mentornotification.types';
import type { Session } from '../../../../components/mentor-components/mentor-dash-com/ScheduledSessions/ScheduledSessions.types';
import type { Review } from '../../../../components/mentor-components/mentor-dash-com/Reviews/Reviews.types';
import type { SalesData } from '../../../../components/mentor-components/mentor-dash-com/SalesChart/SalesChart.types';
import type { DashboardCardsData } from '../types';

export function isApiErrorResponse(res: unknown): res is { error: string } {
    if (res == null || typeof res !== 'object') return false;
    const obj = res as Record<string, unknown>;
    return typeof obj.error === 'string' && obj.error.length > 0;
}

export function extractCardsData(res: unknown): DashboardCardsData | null {
    if (res == null || typeof res !== 'object') return null;
    if (isApiErrorResponse(res)) return null;

    const obj = res as Record<string, unknown>;

    let cardsData: Record<string, unknown> | undefined;

    if (obj.apiResponse && typeof obj.apiResponse === 'object') {
        const apiRes = obj.apiResponse as Record<string, unknown>;
        cardsData = apiRes.cards as Record<string, unknown> | undefined;
    }

    if (!cardsData && obj.data && typeof obj.data === 'object') {
        const dataObj = obj.data as Record<string, unknown>;
        if (dataObj.apiResponse && typeof dataObj.apiResponse === 'object') {
            const dataApiRes = dataObj.apiResponse as Record<string, unknown>;
            cardsData = dataApiRes.cards as Record<string, unknown> | undefined;
        }
    }

    if (!cardsData && obj.cards && typeof obj.cards === 'object') {
        cardsData = obj.cards as Record<string, unknown>;
    }

    if (!cardsData || typeof cardsData !== 'object') {
        return { totalStudents: 0, totalMentorships: 0, averageRating: 0, totalRevenue: 0 };
    }

    const totalStudents = Number(
        cardsData.totalStudents ?? cardsData.total_students ?? cardsData['Total Student'] ?? 0
    );
    const totalMentorships = Number(
        cardsData.totalMentorships ?? cardsData.total_mentorships ?? cardsData['Total Mentorships'] ?? 0
    );
    const averageRating = Number(
        cardsData.averageRating ?? cardsData.average_rating ?? cardsData['Average Rating'] ?? 0
    );
    const totalRevenue = Number(
        cardsData.totalRevenue ?? cardsData.total_revenue ?? cardsData['Total Revenue'] ?? 0
    );

    return {
        totalStudents,
        totalMentorships,
        averageRating,
        totalRevenue,
    };
}

export function mapSessions(raw: unknown): Session[] {
    const dataArray = extractSessionsData(raw);

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.warn('⚠️ No upcoming sessions data found');
        return [];
    }

    console.log('📅 Upcoming Sessions Count:', dataArray.length);

    return dataArray
        .map((rawItem) => {
            const item = rawItem as Record<string, unknown>;
            const title = String(
                item.title ?? item.name ?? item.mentorshipTitle ?? 'Session'
            );

            const rawDateTime =
                item.sessionStartDate ?? item.session_date ?? item.date ?? '';
            const fallbackId = `${title}-${String(rawDateTime)}`;
            const id = String(item.id ?? item.sessionId ?? fallbackId);
            let startTime = String(item.startTime ?? item.start ?? '');
            const endTime = String(item.endTime ?? item.end ?? '');
            let date: string | undefined = undefined;

            if (rawDateTime && typeof rawDateTime === 'string') {
                const parsed = new Date(rawDateTime);
                if (!isNaN(parsed.getTime())) {
                    date = parsed.toISOString().split('T')[0];
                    if (!startTime) startTime = parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                }
            }

            const type = (item.type as Session['type']) ?? 'course';

            if (id && title) {
                console.log(
                    `   📌 ${title} (${type}) | ${startTime} - ${endTime}${date ? ` [${date}]` : ''}`
                );
            }

            return {
                id,
                mentorshipId: String(item.mentorshipId ?? item.mentorship_id ?? (item.mentorship && typeof item.mentorship === 'object' && 'id' in item.mentorship ? (item.mentorship as Record<string, unknown>).id : undefined) ?? ''),
                title,
                startTime,
                endTime,
                type,
                date,
            };
        })
        .filter((s) => s.id && s.title);
}

export function mapReviews(raw: unknown): Review[] {
    const dataArray = extractReviewsData(raw);

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.warn('⚠️ No reviews data found');
        return [];
    }

    console.log('⭐ Reviews Count:', dataArray.length);

    return dataArray
        .map((rawItem) => {
            const item = rawItem as Record<string, unknown>;
            const id = String(item.id ?? '');
            const studentName = String(item.studentName ?? 'Student');
            const courseTitle = String(item.courseTitle ?? item.mentorshipTitle ?? 'Course');
            const rating = Number(item.rating) || 0;
            const comment = String(item.comment ?? '');
            const date = String(item.date ?? item.createdAt ?? '');
            const studentAvatar = item.studentAvatar ? String(item.studentAvatar) : undefined;

            if (id && rating > 0) {
                console.log(`   ⭐ ${studentName}: ${rating}/5 - "${comment.substring(0, 40)}${comment.length > 40 ? '...' : ''}"`);
            }

            return {
                id,
                studentName,
                studentAvatar,
                courseTitle,
                rating,
                comment,
                date,
            };
        })
        .filter(r => r.id && r.rating > 0);
}

export function mapNotifications(raw: unknown): Notification[] {
    const dataArray = extractNotificationsData(raw);
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.warn('⚠️ No notifications data found');
        return [];
    }

    console.log('🔔 Notifications Count:', dataArray.length);
    return dataArray
        .map((item) => {
            const n = item as Record<string, unknown>;
            const id = String(n.id ?? n.notificationId ?? '');
            const type = String(n.type ?? 'general') as Notification['type'];
            const title = String(n.title ?? '');
            // Backend fields: content + time
            // UI fields: message + timestamp
            const message = String(n.message ?? n.content ?? '');
            const timestamp = String(n.timestamp ?? n.time ?? n.date ?? '');
            const isRead = Boolean(n.isRead ?? n.read ?? false);
            // if backend doesn't provide isNew, derive it from read
            const isNew = Boolean(n.isNew ?? n.new ?? !(n.isRead ?? n.read ?? false));


            const icon = n.icon ? String(n.icon) : undefined;
            const actionLabel = n.actionLabel ? String(n.actionLabel) : undefined;
            const actionUrl = n.actionUrl ? String(n.actionUrl) : undefined;

            return {
                id,
                type,
                title,
                message,
                timestamp,
                isRead,
                isNew,
                icon,
                actionLabel,
                actionUrl,
            } as Notification;
        })
        .filter((n) => n.id);
}

export function mapRevenueChart(raw: unknown): SalesData[] {
    const dataArray = extractRevenueChartData(raw);

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.warn('⚠️ No revenue chart data found');
        return [];
    }

    console.log('📊 Revenue Chart Data Points:', dataArray.length);

    return dataArray
        .map((rawItem) => {
            const item = rawItem as Record<string, unknown>;
            const value = Number(
                item.value ??
                item.sales ??
                item.revenue ??
                item.amount ??
                item.totalRevenue ??
                item.total_revenue ??
                0
            );
            const rawMonth = item.month ?? item.label ?? item.date ?? '';
            const month = String(rawMonth);

            if (value > 0 && month) {
                console.log(`   📈 ${month}: $${value.toLocaleString()}`);
            }

            return {
                month,
                value,
            };
        })
        .filter(d => d.month); // Allow 0 values to be displayed
}
