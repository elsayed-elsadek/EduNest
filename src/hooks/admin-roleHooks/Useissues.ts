
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
  deleteAllMessages,
  sendNotification,
  sendReply,
} from '../../services/admin-role-service/issueservice';
import type { AllResponse } from '../../services/admin-role-service/issueservice';
import { mapApiMessage, UI_TO_API } from '../../types/admin-role-types/issues.types';
import type { AdminMessage, MessageStatus } from '../../types/admin-role-types/issues.types';

export const ISSUES_KEY = ['contact-messages'] as const;

// Helper: Extract error message from Axios error response safely
const extractErrorMessage = (err: unknown): string => {
  if (!err || typeof err !== 'object') {
    return 'An error occurred while sending notification';
  }

  const error = err as Record<string, unknown>;

  // Try Axios error structure first: error.response.data.errorMessages.error
  if (error.response && typeof error.response === 'object') {
    const response = error.response as Record<string, unknown>;
    const data = response.data;
    
    if (data && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>;
      
      // Check errorMessages.error from backend
      if (dataObj.errorMessages && typeof dataObj.errorMessages === 'object') {
        const msgs = dataObj.errorMessages as Record<string, unknown>;
        if (typeof msgs.error === 'string') {
          return msgs.error;
        }
      }
      
      // Check apiResponse.Status (success messages)
      if (dataObj.apiResponse && typeof dataObj.apiResponse === 'object') {
        const apiResp = dataObj.apiResponse as Record<string, unknown>;
        if (typeof apiResp.Status === 'string') {
          return apiResp.Status;
        }
      }
    }
    
    // Check HTTP status code
    if (typeof response.status === 'number') {
      return `Request failed with status code ${response.status}`;
    }
  }

  // Fallback to error.message
  if (typeof error.message === 'string') {
    return error.message;
  }

  return 'An error occurred while sending notification';
};

export const useIssues = () => {
  const qc = useQueryClient();


  const { data: messages = [], isLoading, isError } = useQuery({
    queryKey: ISSUES_KEY,
    queryFn:  getAllMessages,
    staleTime: 0,
    gcTime:   5 * 60 * 1000,
    select: (res) =>
      (res?.apiResponse?.Data ?? []).map(mapApiMessage) as AdminMessage[],
  });

  const refetch = () => qc.invalidateQueries({ queryKey: ISSUES_KEY });

  // Helper: patch raw cache (keeps shape compatible with select)
  const patchRaw = (updater: (prev: AllResponse) => AllResponse) => {
    qc.setQueryData<AllResponse>(ISSUES_KEY, (old) => {
      if (!old) return old;
      return updater(old);
    });
  };

  // Delete one 
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMessage(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ISSUES_KEY });
      const snapshot = qc.getQueryData<AllResponse>(ISSUES_KEY);
      patchRaw((old) => ({
        ...old,
        apiResponse: {
          ...old.apiResponse,
          Data: old.apiResponse.Data.filter((m) => m.id !== id),
        },
      }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Message deleted'),
    onError: (_err, _id, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(ISSUES_KEY, ctx.snapshot);
      toast.error('Failed to delete message');
    },
    onSettled: () => refetch(),
  });

  // Delete all 
  const deleteAllMutation = useMutation({
    mutationFn: deleteAllMessages,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ISSUES_KEY });
      const snapshot = qc.getQueryData<AllResponse>(ISSUES_KEY);
      patchRaw((old) => ({
        ...old,
        apiResponse: { ...old.apiResponse, Data: [] },
      }));
      return { snapshot };
    },
    onSuccess: () => toast.success('All messages deleted'),
    onError: (_err, _v, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(ISSUES_KEY, ctx.snapshot);
      toast.error('Failed to delete messages');
    },
    onSettled: () => refetch(),
  });

  //  Update status 
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: MessageStatus }) =>
      updateMessageStatus(id, UI_TO_API[status]),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ISSUES_KEY });
      const snapshot = qc.getQueryData<AllResponse>(ISSUES_KEY);
      patchRaw((old) => ({
        ...old,
        apiResponse: {
          ...old.apiResponse,
          Data: old.apiResponse.Data.map((m) =>
            m.id === id ? { ...m, status: UI_TO_API[status] } : m
          ),
        },
      }));
      return { snapshot };
    },
    onSuccess: () => toast.success('Status updated'),
    onError: (_err, _v, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(ISSUES_KEY, ctx.snapshot);
      toast.error('Failed to update status');
    },
    onSettled: () => refetch(),
  });

  //  Send notification 
  const notifMutation = useMutation({
    mutationFn: ({ id, title, content }: { id: number; title: string; content: string }) =>
      sendNotification(id, title, content),
    onSuccess: (data) => {
      const message = data?.apiResponse?.Status ?? 'Notification sent successfully';
      toast.success(message);
    },
    onError:   (err) => {
      const message = extractErrorMessage(err);
      toast.error(message);
    },
  });

  //  Send reply 
  const replyMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => sendReply(id, text),
    onSuccess: (data) => {
      const message = data?.apiResponse?.Status ?? 'Reply sent successfully';
      toast.success(message);
      refetch();
    },
    onError: (err) => {
      const message = extractErrorMessage(err);
      toast.error(message);
    },
  });

  return {
    messages,
    loading:        isLoading,
    isError,

    // Guard: skip if status already matches (uses mapped `messages`)
    setStatus: (id: number, newStatus: MessageStatus) => {
      const current = messages.find((m) => m.id === id);
      if (current?.status === newStatus) return;
      statusMutation.mutate({ id, status: newStatus });
    },

    deleteOne: (id: number) => deleteMutation.mutate(id),
    deleteAll: () => deleteAllMutation.mutate(),

    sendNotif: (id: number, title: string, content: string) =>
      notifMutation.mutate({ id, title, content }),
    sendReply: (id: number, text: string) =>
      replyMutation.mutate({ id, text }),

    deleting:       deleteMutation.isPending,
    deletingAll:    deleteAllMutation.isPending,
    updatingStatus: statusMutation.isPending,
    sendingNotif:   notifMutation.isPending,
    sendingReply:   replyMutation.isPending,
  };
};