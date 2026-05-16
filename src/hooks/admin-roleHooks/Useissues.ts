
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
    onSuccess: () => toast.success('Notification sent'),
    onError:   () => toast.error('Failed to send notification'),
  });

  //  Send reply 
  const replyMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => sendReply(id, text),
    onSuccess: () => {
      toast.success('Reply sent via email');
      refetch();
    },
    onError: () => toast.error('Failed to send reply'),
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