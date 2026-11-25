import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getAllConversationsMock,
  privateHandlers,
  wsServiceMock,
} = vi.hoisted(() => ({
  getAllConversationsMock: vi.fn(),
  privateHandlers: [] as Array<(payload: unknown) => void>,
  wsServiceMock: {
    connect: vi.fn(),
    subscribeToPrivateMessages: vi.fn(),
    unsubscribe: vi.fn(),
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

vi.mock('../../services/Websocketservice', () => ({ wsService: wsServiceMock }));

vi.mock('../../services/Directchatservice', () => ({
  getAllConversations: getAllConversationsMock,
}));

import { useDirectChatUnreadCount } from '../useDirectChatUnreadCount';

const CONV_A = 'conv-a-uuid';
const BASELINE_UNREAD = 2;

const privateMessage = (
  id: string,
  conversationId: string,
  senderEmail = 'mentor@example.com',
) => ({
  id,
  conversationId,
  senderEmail,
  senderName: 'Mentor',
  content: 'hello',
  sentAt: '2026-01-01T00:00:00Z',
});

const emitPrivate = (payload: unknown) => {
  expect(privateHandlers).toHaveLength(1);
  act(() => { privateHandlers[0](payload); });
};

const renderWithBaseline = async () => {
  const rendered = renderHook(() => useDirectChatUnreadCount());
  await waitFor(() => {
    expect(rendered.result.current.unreadCount).toBe(BASELINE_UNREAD);
  });
  return rendered;
};

beforeEach(() => {
  vi.resetAllMocks();
  privateHandlers.length = 0;

  wsServiceMock.subscribeToPrivateMessages.mockImplementation(
    (cb: (payload: unknown) => void) => { privateHandlers.push(cb); },
  );
  getAllConversationsMock.mockResolvedValue({
    apiResponse: {
      conversations: [{
        conversationId: CONV_A,
        otherUserName: 'Mentor',
        otherUserEmail: 'mentor@example.com',
        unreadCount: BASELINE_UNREAD,
      }],
    },
  });
});

describe('INT-04 Batch 3 — useDirectChatUnreadCount deduplication', () => {
  it('increments only once for duplicate message ids', async () => {
    const { result } = await renderWithBaseline();
    const event = privateMessage('msg-1', CONV_A);

    emitPrivate(event);
    emitPrivate(event);
    emitPrivate(privateMessage('msg-1', CONV_A));

    expect(result.current.unreadCount).toBe(BASELINE_UNREAD + 1);
  });

  it('ignores events that cannot be safely identified as a new message', async () => {
    const { result } = await renderWithBaseline();

    emitPrivate({ id: 123, conversationId: CONV_A, content: 'numeric message id' });
    emitPrivate({ id: 'msg-2', conversationId: 456, content: 'numeric conversation id' });
    emitPrivate({ id: 'msg-3', content: 'missing conversation id' });
    emitPrivate({ conversationId: CONV_A, content: 'missing message id' });
    emitPrivate({ type: 'DELETE', messageId: 'msg-4', conversationId: CONV_A });

    expect(result.current.unreadCount).toBe(BASELINE_UNREAD);
  });

  it('ignores DELETE and self-sender events', async () => {
    const { result } = await renderWithBaseline();

    emitPrivate(privateMessage('msg-self', CONV_A, 'STUDENT@EXAMPLE.COM'));
    emitPrivate({
      type: 'DELETE',
      messageId: 'msg-delete',
      conversationId: CONV_A,
      senderEmail: 'mentor@example.com',
    });

    expect(result.current.unreadCount).toBe(BASELINE_UNREAD);
  });

  it('preserves the existing increment for a valid new message', async () => {
    const { result } = await renderWithBaseline();

    expect(wsServiceMock.connect).toHaveBeenCalledWith('test-token');
    expect(wsServiceMock.subscribeToPrivateMessages).toHaveBeenCalledTimes(1);

    emitPrivate(privateMessage('msg-new', CONV_A));

    expect(result.current.unreadCount).toBe(BASELINE_UNREAD + 1);
  });
});
