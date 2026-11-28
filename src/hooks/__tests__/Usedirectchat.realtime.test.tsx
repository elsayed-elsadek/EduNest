import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Chat, ConversationMessageDto } from '../../types/mentor-meaasges.types';

const {
  getAllConversationsMock,
  getConversationMessagesMock,
  editMessageMock,
  deleteMessageMock,
  privateHandlers,
  wsServiceMock,
} = vi.hoisted(() => ({
  getAllConversationsMock: vi.fn(),
  getConversationMessagesMock: vi.fn(),
  editMessageMock: vi.fn(),
  deleteMessageMock: vi.fn(),
  privateHandlers: [] as Array<(payload: unknown) => void>,
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

const CONV_A = 'conv-a-uuid';
const CONV_B = 'conv-b-uuid';

const CHAT_A: Chat = {
  id: 'direct-conv-a-uuid',
  mode: 'direct',
  userId: 'mentor@example.com',
  userName: 'Mentor A',
  lastMessage: '',
  timestamp: '',
  unreadCount: 0,
  conversationId: CONV_A,
};

const CHAT_B: Chat = {
  ...CHAT_A,
  id: 'direct-conv-b-uuid',
  userName: 'Mentor B',
  conversationId: CONV_B,
};

const messageDto = (
  id: string,
  conversationId: string,
  content: string,
  sentAt = '2026-01-01T00:00:00Z',
): ConversationMessageDto => ({
  id,
  conversationId,
  senderEmail: 'Mentor@Example.com',
  senderName: 'Mentor',
  content,
  sentAt,
});

const historyResponse = (messages: ConversationMessageDto[]) => ({
  apiResponse: { messages },
});

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
};

const emitPrivate = (payload: unknown) => {
  expect(privateHandlers).toHaveLength(1);
  act(() => { privateHandlers[0](payload); });
};

beforeEach(() => {
  vi.resetAllMocks();
  privateHandlers.length = 0;

  wsServiceMock.connect.mockImplementation((_token: string, onConnected?: () => void) => {
    onConnected?.();
  });
  wsServiceMock.subscribeToPrivateMessages.mockImplementation(
    (cb: (payload: unknown) => void) => { privateHandlers.push(cb); },
  );

  getAllConversationsMock.mockResolvedValue({ apiResponse: { conversations: [] } });
  getConversationMessagesMock.mockResolvedValue(historyResponse([]));
  editMessageMock.mockResolvedValue({});
  deleteMessageMock.mockResolvedValue({});
});

describe('INT-04 Batch 3 — useDirectChat realtime/history consistency', () => {
  it('uses one private-message handler and subscription across conversation switches', async () => {
    const { result, unmount } = renderHook(() => useDirectChat());

    await act(async () => { await result.current.openConversation(CHAT_A); });
    await act(async () => { await result.current.openConversation(CHAT_B); });

    expect(wsServiceMock.connect).toHaveBeenCalledTimes(1);
    expect(wsServiceMock.subscribeToPrivateMessages).toHaveBeenCalledTimes(1);
    expect(privateHandlers).toHaveLength(1);

    unmount();
    expect(wsServiceMock.unsubscribe).toHaveBeenCalledWith(
      '/user/queue/messages',
      privateHandlers[0],
    );
  });

  it('ignores CREATE/EDIT events from other conversations and without a conversation id', async () => {
    const { result } = renderHook(() => useDirectChat());
    await act(async () => { await result.current.openConversation(CHAT_A); });

    emitPrivate(messageDto('msg-other', CONV_B, 'other conversation'));
    emitPrivate({ id: 'msg-no-conversation', content: 'no conversation' });

    expect(result.current.messages).toEqual([]);
  });

  it('deduplicates repeated CREATE echoes and upserts EDIT by message id', async () => {
    getConversationMessagesMock.mockResolvedValueOnce(
      historyResponse([messageDto('msg-1', CONV_A, 'original')]),
    );
    const { result } = renderHook(() => useDirectChat());
    await act(async () => { await result.current.openConversation(CHAT_A); });

    const createEvent = messageDto('msg-1', CONV_A, 'original');
    emitPrivate(createEvent);
    emitPrivate(createEvent);
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('original');

    const editEvent = messageDto('msg-1', CONV_A, 'edited');
    emitPrivate(editEvent);
    emitPrivate(editEvent);

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      id: 'msg-1',
      chatId: CONV_A,
      content: 'edited',
      edited: true,
    });
  });

  it('scopes DELETE by both message id and conversation id', async () => {
    getConversationMessagesMock
      .mockResolvedValueOnce(historyResponse([
        messageDto('msg-2', CONV_A, 'second'),
        messageDto('msg-1', CONV_A, 'first'),
      ]))
      .mockResolvedValueOnce(historyResponse([
        messageDto('msg-1', CONV_B, 'same id in another conversation'),
      ]));
    const { result } = renderHook(() => useDirectChat());

    await act(async () => { await result.current.openConversation(CHAT_A); });
    emitPrivate({ type: 'DELETE', messageId: 'msg-1', conversationId: CONV_B });
    emitPrivate({ type: 'DELETE', messageId: 'msg-unknown', conversationId: CONV_A });
    expect(result.current.messages.map(m => m.id)).toEqual(['msg-1', 'msg-2']);

    emitPrivate({ type: 'DELETE', messageId: 'msg-1', conversationId: CONV_A });
    expect(result.current.messages.map(m => m.id)).toEqual(['msg-2']);

    await act(async () => { await result.current.openConversation(CHAT_B); });
    emitPrivate({ type: 'DELETE', messageId: 'msg-1', conversationId: CONV_A });
    expect(result.current.messages.map(m => m.id)).toEqual(['msg-1']);
  });

  it('does not resurrect a deleted message when an older history response finishes', async () => {
    const history = deferred<ReturnType<typeof historyResponse>>();
    getConversationMessagesMock.mockImplementationOnce(() => history.promise);
    const { result } = renderHook(() => useDirectChat());

    let openPromise: Promise<void> | undefined;
    act(() => { openPromise = result.current.openConversation(CHAT_A); });

    await act(async () => { await result.current.handleDeleteMessage('msg-1'); });
    expect(deleteMessageMock).toHaveBeenCalledWith('msg-1');

    await act(async () => {
      history.resolve(historyResponse([
        messageDto('msg-1', CONV_A, 'stale'),
        messageDto('msg-2', CONV_A, 'fresh'),
      ]));
      await openPromise;
    });

    expect(result.current.messages.map(m => m.id)).toEqual(['msg-2']);
  });

  it('prevents stale history from a previous conversation overwriting the active one', async () => {
    const staleHistory = deferred<ReturnType<typeof historyResponse>>();
    getConversationMessagesMock
      .mockImplementationOnce(() => staleHistory.promise)
      .mockResolvedValueOnce(historyResponse([
        messageDto('msg-b', CONV_B, 'current conversation'),
      ]));
    const { result } = renderHook(() => useDirectChat());

    let staleOpenPromise: Promise<void> | undefined;
    act(() => { staleOpenPromise = result.current.openConversation(CHAT_A); });

    await act(async () => { await result.current.openConversation(CHAT_B); });
    expect(result.current.messages.map(m => m.id)).toEqual(['msg-b']);

    await act(async () => {
      staleHistory.resolve(historyResponse([
        messageDto('msg-stale', CONV_A, 'stale conversation'),
      ]));
      await staleOpenPromise;
    });

    expect(result.current.activeChat?.conversationId).toBe(CONV_B);
    expect(result.current.messages.map(m => m.id)).toEqual(['msg-b']);
  });

  it('preserves realtime CREATE/EDIT updates that arrive while history is loading', async () => {
    const history = deferred<ReturnType<typeof historyResponse>>();
    getConversationMessagesMock.mockImplementationOnce(() => history.promise);
    const { result } = renderHook(() => useDirectChat());

    let openPromise: Promise<void> | undefined;
    act(() => { openPromise = result.current.openConversation(CHAT_A); });

    emitPrivate(messageDto('msg-live', CONV_A, 'arrived while loading', '2026-01-03T00:00:00Z'));
    emitPrivate(messageDto('msg-1', CONV_A, 'edited while loading'));

    await act(async () => {
      history.resolve(historyResponse([
        messageDto('msg-2', CONV_A, 'second', '2026-01-02T00:00:00Z'),
        messageDto('msg-1', CONV_A, 'first'),
      ]));
      await openPromise;
    });

    expect(result.current.messages.map(m => m.id)).toEqual(['msg-1', 'msg-2', 'msg-live']);
    expect(result.current.messages[0]).toMatchObject({
      id: 'msg-1',
      content: 'edited while loading',
      edited: true,
    });
    expect(result.current.messages[2]).toMatchObject({
      id: 'msg-live',
      content: 'arrived while loading',
    });
  });

  it('keeps normal history ordering, appends realtime messages, and preserves send payload', async () => {
    getConversationMessagesMock.mockResolvedValueOnce(historyResponse([
      messageDto('msg-2', CONV_A, 'second', '2026-01-02T00:00:00Z'),
      messageDto('msg-1', CONV_A, 'first'),
    ]));
    const { result } = renderHook(() => useDirectChat());

    await act(async () => { await result.current.openConversation(CHAT_A); });
    expect(result.current.messages.map(m => m.id)).toEqual(['msg-1', 'msg-2']);

    emitPrivate(messageDto('msg-3', CONV_A, 'third', '2026-01-03T00:00:00Z'));
    expect(result.current.messages.map(m => m.id)).toEqual(['msg-1', 'msg-2', 'msg-3']);

    act(() => { result.current.sendMessage('mentor@example.com', 'hello'); });
    expect(wsServiceMock.sendPrivateMessage).toHaveBeenCalledWith(
      'mentor@example.com',
      'hello',
    );
  });

  it('resolves a pending first message to the real conversation from the server event', async () => {
    const { result } = renderHook(() => useDirectChat());

    act(() => { result.current.beginPendingDirectChat('mentor@example.com'); });
    getAllConversationsMock.mockResolvedValueOnce({
      apiResponse: {
        conversations: [{
          conversationId: CONV_A,
          otherUserName: 'Mentor A',
          otherUserEmail: 'mentor@example.com',
          lastMessage: 'hello',
          lastMessageTime: '2026-01-01T00:00:00Z',
          unreadCount: 0,
        }],
      },
    });

    await act(async () => {
      await privateHandlers[0]({
        id: 'msg-first',
        conversationId: CONV_A,
        senderEmail: 'student@example.com',
        recipientEmail: 'mentor@example.com',
        senderName: 'Student',
        content: 'hello',
        sentAt: '2026-01-01T00:00:00Z',
      });
    });

    expect(result.current.pendingResolvedChat).toMatchObject({
      id: `direct-${CONV_A}`,
      conversationId: CONV_A,
    });
    expect(result.current.activeChat).toMatchObject({ conversationId: CONV_A });
    expect(result.current.messages).toEqual([]);
  });
});
