import type { MentorshipApiResponse } from './types';

/** Extract mentorships array from various API response shapes */
export function extractMentorshipsData(response: unknown): MentorshipApiResponse[] {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object') as MentorshipApiResponse[];
  }

  const data = response as Record<string, unknown>;
  const commonKeys = ['mentorships', 'data', 'items', 'results', 'courses'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object') as MentorshipApiResponse[];
    }
  }

  return [];
}

/** Extract revenue/chart array from API response */
export function extractRevenueChartData(response: unknown): unknown[] {
  if (!response) return [];
  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object');
  }

  const data = response as Record<string, unknown>;

  // new dashboard response wraps everything under apiResponse.dashboard
  if (data.apiResponse && typeof data.apiResponse === 'object') {
    const apiRes = data.apiResponse as Record<string, unknown>;
    // if the new combined dashboard is present, dive into it
    if (apiRes.dashboard && typeof apiRes.dashboard === 'object') {
      return extractRevenueChartData(apiRes.dashboard);
    }

    const apiChartKeys = ['sales-chart', 'sales_chart', 'revenueChart', 'revenue_chart'];
    for (const key of apiChartKeys) {
      if (Array.isArray(apiRes[key])) {
        return (apiRes[key] as unknown[]).filter((item) => item && typeof item === 'object');
      }
    }
  }

  const commonKeys = ['sales-chart', 'sales_chart', 'data', 'chart', 'values', 'points', 'series', 'revenueData', 'revenue_data', 'items', 'results'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  return [];
}

/** Extract sessions array from API response */
export function extractSessionsData(response: unknown): unknown[] {
  if (!response) return [];
  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object');
  }

  const data = response as Record<string, unknown>;
  // new dashboard shape
  if (data.dashboard && typeof data.dashboard === 'object') {
    return extractSessionsData(data.dashboard);
  }
  // if `sessions` is an object with a `content` array (new API shape)
  if (data.sessions && typeof data.sessions === 'object') {
    const s = data.sessions as Record<string, unknown>;
    if (Array.isArray(s.content)) {
      return (s.content as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  const commonKeys = ['sessions', 'data', 'items', 'results', 'upcomingSessions', 'upcoming_sessions', 'content'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  if (data.apiResponse && typeof data.apiResponse === 'object') {
    const apiRes = data.apiResponse as Record<string, unknown>;
    if (apiRes.dashboard && typeof apiRes.dashboard === 'object') {
      return extractSessionsData(apiRes.dashboard);
    }
    if (Array.isArray(apiRes.sessions)) {
      return (apiRes.sessions as unknown[]).filter((item) => item && typeof item === 'object');
    }
    // apiResponse.sessions may be an object with a content array
    if (apiRes.sessions && typeof apiRes.sessions === 'object') {
      const s2 = apiRes.sessions as Record<string, unknown>;
      if (Array.isArray(s2.content)) {
        return (s2.content as unknown[]).filter((item) => item && typeof item === 'object');
      }
    }
  }

  return [];
}

/** Extract notifications array from API response */
export function extractNotificationsData(response: unknown): unknown[] {
  if (!response) return [];
  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object');
  }

  const data = response as Record<string, unknown>;

  // dashboard wrapper
  if (data.dashboard && typeof data.dashboard === 'object') {
    return extractNotificationsData(data.dashboard);
  }

  if (data.apiResponse && typeof data.apiResponse === 'object') {
    const apiRes = data.apiResponse as Record<string, unknown>;
    if (apiRes.dashboard && typeof apiRes.dashboard === 'object') {
      return extractNotificationsData(apiRes.dashboard);
    }
    if (apiRes.notifications && typeof apiRes.notifications === 'object') {
      const noti = apiRes.notifications as Record<string, unknown>;
      if (Array.isArray(noti.content)) {
        return (noti.content as unknown[]).filter((item) => item && typeof item === 'object');
      }
    }
  }

  const commonKeys = ['notifications', 'data', 'items', 'results', 'content'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  // support when `notifications` is present directly with a content array
  if (data.notifications && typeof data.notifications === 'object') {
    const n = data.notifications as Record<string, unknown>;
    if (Array.isArray(n.content)) {
      return (n.content as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  return [];
}

/** Extract reviews array from API response */
export function extractReviewsData(response: unknown): unknown[] {
  if (!response) return [];
  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object');
  }

  const data = response as Record<string, unknown>;

  // check new dashboard wrapper first
  if (data.dashboard && typeof data.dashboard === 'object') {
    return extractReviewsData(data.dashboard);
  }

  if (data.apiResponse && typeof data.apiResponse === 'object') {
    const apiRes = data.apiResponse as Record<string, unknown>;
    if (apiRes.dashboard && typeof apiRes.dashboard === 'object') {
      return extractReviewsData(apiRes.dashboard);
    }
    if (apiRes.reviews && typeof apiRes.reviews === 'object') {
      const reviews = apiRes.reviews as Record<string, unknown>;
      if (Array.isArray(reviews.content)) {
        return (reviews.content as unknown[]).filter((item) => item && typeof item === 'object');
      }
    }
  }

  const commonKeys = ['reviews', 'data', 'items', 'results', 'content'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  // handle reviews when provided as an object with a `content` array
  if (data.reviews && typeof data.reviews === 'object') {
    const rv = data.reviews as Record<string, unknown>;
    if (Array.isArray(rv.content)) {
      return (rv.content as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  return [];
}
