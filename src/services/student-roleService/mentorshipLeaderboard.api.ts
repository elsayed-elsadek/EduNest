import { useQuery } from '@tanstack/react-query';
import api from '../api';
import type {
  MentorshipLeaderboardApiResponse,
  MentorshipLeaderboardPayload,
} from '../../types/student-role-types/mentorshipLeaderboardTypes';

export const mentorshipLeaderboardKeys = {
  list: (mentorshipId: string | number, page = 0, size = 10) =>
    ['mentorshipLeaderboard', mentorshipId, page, size] as const,
};

export const fetchMentorshipLeaderboard = async (
  mentorshipId: string | number,
  size = 10,
  page = 0,
  signal?: AbortSignal
): Promise<MentorshipLeaderboardPayload> => {
  const { data } = await api.get<MentorshipLeaderboardApiResponse>(
    `/api/v1/student/mentorships/${mentorshipId}/leaderboard`,
    {
      params: { size, page },
      signal,
    }
  );

  if (!data?.apiResponse?.leaderboard) {
    throw new Error('Unable to load mentorship leaderboard.');
  }

  return data.apiResponse.leaderboard;
};

export const useMentorshipLeaderboard = (
  mentorshipId: string | number,
  enabled = true
) =>
  useQuery({
    queryKey: mentorshipLeaderboardKeys.list(mentorshipId),
    queryFn: ({ signal }) => fetchMentorshipLeaderboard(mentorshipId, 10, 0, signal),
    enabled: enabled && !!mentorshipId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
