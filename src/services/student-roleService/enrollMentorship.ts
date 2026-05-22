import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api';
import type {
  JoinMentorshipSuccessResponse,
  JoinMentorshipErrorResponse,
} from '../../types/student-role-types/studentMentorshipTypes';

// ------------------------------------------------------------------
// API Function
// ------------------------------------------------------------------

/**
 * Sends a POST request to join a mentorship.
 * @param mentorshipId - The numeric ID of the mentorship to join.
 * @returns The success message from the backend.
 * @throws Error with a descriptive message on failure.
 */
export const joinMentorship = async (mentorshipId: number): Promise<string> => {
  const { data } = await api.post<JoinMentorshipSuccessResponse>(
    `/api/v1/mentorship/${mentorshipId}/join`
  );

  return data.apiResponse.message;
};

// ------------------------------------------------------------------
// React Query Mutation Hook
// ------------------------------------------------------------------

export interface UseJoinMentorshipOptions {
  /** Callback fired after a successful join */
  onSuccess?: (message: string) => void;
  /** Callback fired after an error */
  onError?: (message: string) => void;
}

/**
 * Custom hook for joining a mentorship.
 * Wraps a mutation with toast notifications and cache invalidation.
 */
export const useJoinMentorship = (options?: UseJoinMentorshipOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinMentorship,

    onSuccess: (message) => {
      toast.success(message || 'Mentorship joined successfully');

      // Invalidate related caches so UI reflects the new enrollment
      queryClient.invalidateQueries({ queryKey: ['my-learning'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['mentorships'] });

      options?.onSuccess?.(message);
    },

    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: JoinMentorshipErrorResponse };
        message?: string;
      };

      const backendMessage =
        axiosError.response?.data?.errorMessages?.error ??
        axiosError.message ??
        'Failed to join mentorship. Please try again.';

      toast.error(backendMessage);
      options?.onError?.(backendMessage);
    },
  });
};

