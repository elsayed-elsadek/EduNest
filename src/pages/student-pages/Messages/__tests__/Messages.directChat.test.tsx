import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Chat } from '../../../../types/mentor-meaasges.types';

const {
  locationMock,
  chatListMock,
  chatWindowMock,
  emptyStateMock,
  directMock,
  roomMock,
} = vi.hoisted(() => ({
  locationMock: { state: null as unknown },
  chatListMock: vi.fn(),
  chatWindowMock: vi.fn(),
  emptyStateMock: vi.fn(),
  directMock: {
    loading: false,
    conversationsLoaded: true,
    chats: [] as unknown[],
    messages: [] as unknown[],
    myEmail: 'student@example.com',
    unavailable: false,
    openConversation: vi.fn(),
    sendMessage: vi.fn(),
    handleEditMessage: vi.fn(),
    handleDeleteMessage: vi.fn(),
    markUnavailable: vi.fn(),
    clearUnavailable: vi.fn(),
    refetchConversations: vi.fn(),
    beginPendingDirectChat: vi.fn(),
    cancelPendingDirectChat: vi.fn(),
    pendingResolvedChat: null as unknown,
    clearPendingResolvedChat: vi.fn(),
  },
  roomMock: {
    loading: false,
    rooms: [] as unknown[],
    messages: [] as unknown[],
    myEmail: '',
    openRoom: vi.fn(),
    sendMessage: vi.fn(),
    handleEditMessage: vi.fn(),
    handleDeleteMessage: vi.fn(),
    handleDeleteRoom: vi.fn(),
    handleUpdateRoomImage: vi.fn(),
    refetchRooms: vi.fn(),
  },
}));

vi.mock('react-router-dom', () => ({ useLocation: () => locationMock }));

vi.mock('../../../../components/student-components/common/Navbar/Navbar', () => ({
  default: () => null,
}));

vi.mock('../../../../components/student-components/student-message-com', () => ({
  ChatList: (props: unknown) => { chatListMock(props); return null; },
  ChatWindow: (props: unknown) => { chatWindowMock(props); return null; },
  EmptyState: () => { emptyStateMock(); return null; },
}));

vi.mock('../../../../components/student-components/student-message-com/CreateRoomModal', () => ({
  default: () => null,
}));

vi.mock('../../../../components/student-components/student-message-com/MembersPanel', () => ({
  default: () => null,
}));

vi.mock('../../../../hooks/Usedirectchat', () => ({ useDirectChat: () => directMock }));
vi.mock('../../../../hooks/Useroomchat', () => ({ useRoomChat: () => roomMock }));

import Messages from '../Messages';

const EXISTING_CHAT: Chat = {
  id: 'direct-conv-uuid',
  mode: 'direct',
  userId: 'mentor@example.com',
  userName: 'Existing Mentor',
  lastMessage: '',
  timestamp: '',
  unreadCount: 0,
  conversationId: 'conv-uuid',
};

beforeEach(() => {
  locationMock.state = null;
  directMock.loading = false;
  directMock.conversationsLoaded = true;
  directMock.chats = [];
  directMock.messages = [];
  directMock.unavailable = false;
  directMock.myEmail = 'student@example.com';
  directMock.pendingResolvedChat = null;
  roomMock.loading = false;
  roomMock.rooms = [];
  roomMock.messages = [];
});

describe('INT-04 Batch 2 — student Messages direct navigation', () => {
  it('opens a pending first-message chat instead of fabricating a conversation', () => {
    locationMock.state = {
      openDirectChatWith: { email: 'new@example.com', name: 'Unknown Mentor' },
    };

    render(<Messages />);

    expect(directMock.markUnavailable).not.toHaveBeenCalled();
    expect(directMock.beginPendingDirectChat).toHaveBeenCalledWith('new@example.com');
    expect(directMock.openConversation).not.toHaveBeenCalled();

    const windowProps = chatWindowMock.mock.calls.at(-1)?.[0] as {
      chat: Chat;
      unavailable: boolean;
      onSendMessage: (content: string) => void;
    };
    expect(windowProps.chat).toEqual(expect.objectContaining({
      userId: 'new@example.com',
      userName: 'Unknown Mentor',
    }));
    expect(windowProps.chat).not.toHaveProperty('conversationId');
    expect(windowProps.unavailable).toBe(false);

    act(() => { windowProps.onSendMessage('hello mentor'); });
    expect(directMock.sendMessage).toHaveBeenCalledWith('new@example.com', 'hello mentor');

    const listProps = chatListMock.mock.calls.at(-1)?.[0] as {
      chats: Chat[];
      selectedChatId: string | null;
    };
    expect(listProps.chats).toEqual([]);
    expect(JSON.stringify(listProps)).not.toContain('direct-new-');
  });

  it('waits for conversations to load before opening the requested chat', () => {
    locationMock.state = {
      openDirectChatWith: { email: 'MENTOR@EXAMPLE.COM', name: 'Existing Mentor' },
    };
    directMock.conversationsLoaded = false;

    const { rerender } = render(<Messages />);

    expect(directMock.markUnavailable).not.toHaveBeenCalled();
    expect(directMock.openConversation).not.toHaveBeenCalled();

    directMock.conversationsLoaded = true;
    directMock.chats = [EXISTING_CHAT];
    rerender(<Messages />);

    expect(directMock.markUnavailable).not.toHaveBeenCalled();
    expect(directMock.openConversation).toHaveBeenCalledWith(EXISTING_CHAT);
  });

  it('opens an existing conversation and keeps messaging functional', () => {
    locationMock.state = {
      openDirectChatWith: { email: 'MENTOR@EXAMPLE.COM', name: 'Existing Mentor' },
    };
    directMock.chats = [EXISTING_CHAT];

    render(<Messages />);

    expect(directMock.markUnavailable).not.toHaveBeenCalled();
    expect(directMock.clearUnavailable).toHaveBeenCalled();
    expect(directMock.openConversation).toHaveBeenCalledWith(EXISTING_CHAT);
    expect(screen.queryByText('This conversation is unavailable.')).not.toBeInTheDocument();

    const windowProps = chatWindowMock.mock.calls.at(-1)?.[0] as {
      chat: Chat;
      unavailable: boolean;
      onSendMessage: (content: string) => void;
    };
    expect(windowProps.chat).toBe(EXISTING_CHAT);
    expect(windowProps.unavailable).toBe(false);
    expect(JSON.stringify(chatWindowMock.mock.calls)).not.toContain('direct-new-');

    act(() => { windowProps.onSendMessage('hello mentor'); });
    expect(directMock.sendMessage).toHaveBeenCalledWith(EXISTING_CHAT.userId, 'hello mentor');
  });

  it('switches from the pending chat to the real conversation when the hook resolves it', async () => {
    locationMock.state = {
      openDirectChatWith: { email: 'new@example.com', name: 'New Mentor' },
    };
    directMock.conversationsLoaded = true;

    const { rerender } = render(<Messages />);

    await act(async () => {
      directMock.chats = [EXISTING_CHAT];
      directMock.pendingResolvedChat = EXISTING_CHAT;
      rerender(<Messages />);
    });

    const windowProps = chatWindowMock.mock.calls.at(-1)?.[0] as { chat: Chat };
    expect(windowProps.chat).toBe(EXISTING_CHAT);
    expect(directMock.clearPendingResolvedChat).toHaveBeenCalled();
  });

  it('passes the hook unavailable state to ChatWindow for history failures', () => {
    locationMock.state = {
      openDirectChatWith: { email: 'mentor@example.com', name: 'Existing Mentor' },
    };
    directMock.chats = [EXISTING_CHAT];
    directMock.unavailable = true;

    render(<Messages />);

    expect(chatWindowMock).toHaveBeenCalledWith(
      expect.objectContaining({ chat: EXISTING_CHAT, unavailable: true }),
    );
  });
});
