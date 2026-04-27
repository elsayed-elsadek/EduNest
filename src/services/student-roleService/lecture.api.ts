import { useQuery } from '@tanstack/react-query';
import api from '../api';
import type { LectureApiResponse } from '../../types/student-role-types/studentMentorshipTypes';

// Query Keys System
export const lectureKeys = {
  detail: (lectureId: number) => ['lecture', lectureId] as const,
};

// Fetch Function
export const fetchLecture = async (lectureId: number): Promise<LectureApiResponse> => {
  const { data } = await api.get<LectureApiResponse>(`/lectures/${lectureId}`);
  return data;
};

// Custom Hook
export const useLecture = (lectureId: number | null, enabled = true) => {
  return useQuery({
    queryKey: lectureKeys.detail(lectureId ?? 0),
    queryFn: () => fetchLecture(lectureId!),
    enabled: enabled && !!lectureId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
};

