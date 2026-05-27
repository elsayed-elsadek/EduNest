import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api';

export interface RateMentorshipPayload {
  rating: number;
  feedback: string;
}

export interface RateMentorshipResponse {
  apiResponse?: {
    message?: string;
  };
  message?: string;
}

export const rateMentorship = async ({
  mentorshipId,
  payload,
}: {
  mentorshipId: number | string;
  payload: RateMentorshipPayload;
}): Promise<RateMentorshipResponse> => {
  const { data } = await api.post<RateMentorshipResponse>(
    `/api/v1/mentorship/${mentorshipId}/rate`,
    payload
  );

  return data;
};

export const useRateMentorship = ({
  mentorshipId,
  onSuccess,
}: {
  mentorshipId: number | string | undefined;
  onSuccess?: (message: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RateMentorshipPayload) => {
      if (!mentorshipId) throw new Error('Missing mentorshipId');
      return rateMentorship({ mentorshipId, payload });
    },

    onSuccess: (data) => {
      const message = data?.apiResponse?.message ?? data?.message ?? 'Mentorship rated successfully';
      toast.success(message);

      // Invalidate reviews cache so the UI updates
      queryClient.invalidateQueries({ queryKey: ['mentorshipReviews', mentorshipId] });
      onSuccess?.(message);
    },

    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: unknown; apiResponse?: { message?: unknown } } };
        message?: string;
      };

      const backendMessage =
        axiosError.response?.data?.message ??
        axiosError.response?.data?.apiResponse?.message ??
        axiosError.message ??
        'Failed to rate mentorship';

      toast.error(String(backendMessage));
    },
  });
};

