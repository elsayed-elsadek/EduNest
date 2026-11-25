import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Chat, ConversationMessageDto } from '../../types/mentor-meaasges.types';

const {
  getAllConversationsMock,
  getConversationMessagesMock,
  editMessageMock,
  deleteMessageMock,
  wsServiceMock,
} = vi.hoisted(() => ({
  getAllConversationsMock: vi.fn(),
  getConversationMessagesMock: vi.fn(),
  editMessageMock: vi.fn(),
  deleteMessageMock: vi.fn(),
  wsServiceMock: {
    connect: vi.fn(),
    subscribeToPrivateMessages: vi.fn(),
    unsubscribe: vi.fn(),
    sendPrivateMessage: vi.fn(),
  },
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector: (state: {
    token: string | null;
    isHydrated: boolean;
    userEmail: string | null;
  }) => unknown) => selector({
    token: 'test-token',
    isHydrated: true,
    userEmail: 'student@example.com',
  }),
}));

vi.mock('../../config/env', () => ({
  getAssetUrl: (path: string | null | undefined) => path ?? undefined,
}));

vi.mock('../../services/Websocketservice', () => ({ wsService: wsServiceMock }));

vi.mock('../../services/Directchatservice', () => ({
  getAllConversations: getAllConversationsMock,
  getConversationMessages: getConversationMessagesMock,
  editMessage: editMessageMock,
  deleteMessage: deleteMessageMock,
}));

import { useDirectChat } from '../Usedirectchat';

const CHAT: Chat = {
  id: 'direct-conv-uuid',
  mode: 'direct',
  userId: 'mentor@example.com',
  userName: 'Mentor Name',
  lastMessage: '',
  timestamp: '',
  unreadCount: 0,
  conversationId: 'conv-uuid',
};

const MESSAGE_DTO: ConversationMessageDto = {
  id: 'msg-uuid',
  conversationId: 'conv-uuid',
  senderEmail: 'Mentor@Example.com',
  senderName: 'Mentor Name',
  content: 'original content',
  sentAt: '2026-01-01T00:00:00',
};

const BACKEND_DETAIL = 'SECRET_BACKEND_DETAIL_SHOULD_NOT_LEAK';

function apiError(status: number, errorCode: string): Error {
  return Object.assign(new Error(BACKEND_DETAIL), {
    response: {
      status,
      data: { status, errorCode, message: BACKEND_DETAIL },
    },
    normalized: {
      errorCode,
      known: true,
      message: BACKEND_DETAIL,
      status,
      fields: {},
    },
  });
}

beforeEach(() => {
  getAllConversationsMock.mockResolvedValue({ apiResponse: { conversations: [] } });
  getConversationMessagesMock.mockResolvedValue({ apiResponse: { messages: [] } });
  editMessageMock.mockResolvedValue({});
  deleteMessageMock.mockResolvedValue({});
});

describe('INT-04 Batch 2 — useDirectChat unavailable state', () => {
  it.each([
    [403, 'ERR_FORBIDDEN'],
    [404, 'ERR_RESOURCE_NOT_FOUND'],
  ])('maps HTTP %i to the same generic unavailable state', async (status, errorCode) => {
    getConversationMessagesMock.mockRejectedValueOnce(apiError(status, errorCode));
    const { result } = renderHook(() => useDirectChat());

    await act(async () => { await result.current.openConversation(CHAT); });

    expect(result.current.unavailable).toBe(true);
    expect(result.current.activeChat).toBeNull();
    expect(result.current.messages).toEqual([]);

    const exposed = JSON.stringify(result.current);
    expect(exposed).not.toContain(BACKEND_DETAIL);
    expect(exposed).not.toContain(errorCode);
  });

  it('does not classify a 500 as unavailable', async () => {
    getConversationMessagesMock.mockRejectedValueOnce(apiError(500, 'ERR_INTERNAL_SYSTEM'));
    const { result } = renderHook(() => useDirectChat());

    await act(async () => { await result.current.openConversation(CHAT); });

    expect(result.current.unavailable).toBe(false);
  });

  it('clears unavailable after successfully loading an accessible conversation', async () => {
    getConversationMessagesMock
      .mockRejectedValueOnce(apiError(403, 'ERR_FORBIDDEN'))
      .mockResolvedValueOnce({ apiResponse: { messages: [MESSAGE_DTO] } });
    const { result } = renderHook(() => useDirectChat());

    await act(async () => { await result.current.openConversation(CHAT); });
    expect(result.current.unavailable).toBe(true);

    await act(async () => { await result.current.openConversation(CHAT); });
    expect(result.current.unavailable).toBe(false);
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('original content');
  });

  it('never fabricates a conversation when the chat has no conversation id', async () => {
    const { result } = renderHook(() => useDirectChat());

    await act(async () => {
      await result.current.openConversation({ ...CHAT, conversationId: undefined });
    });

    expect(result.current.unavailable).toBe(true);
    expect(result.current.activeChat).toBeNull();
    expect(getConversationMessagesMock).not.toHaveBeenCalled();
  });
});

describe('INT-04 Batch 2 — optimistic edit/delete rollback', () => {
  beforeEach(async () => {
    getConversationMessagesMock.mockResolvedValueOnce({
      apiResponse: { messages: [MESSAGE_DTO] },
    });
  });

  it('restores the original message when edit fails', async () => {
    editMessageMock.mockRejectedValueOnce(new Error('PATCH failed'));
    const { result } = renderHook(() => useDirectChat());

    await act(async () => { await result.current.openConversation(CHAT); });
    await act(async () => {
      await result.current.handleEditMessage('msg-uuid', 'optimistic content');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('original content');
    expect(result.current.messages[0].edited).toBeUndefined();
  });

  it('restores the deleted message when delete fails', async () => {
    deleteMessageMock.mockRejectedValueOnce(new Error('DELETE failed'));
    const { result } = renderHook(() => useDirectChat());

    await act(async () => { await result.current.openConversation(CHAT); });
    await act(async () => { await result.current.handleDeleteMessage('msg-uuid'); });

    expect(result.current.messages).toEqual([
      expect.objectContaining({ id: 'msg-uuid', content: 'original content' }),
    ]);
  });
});
