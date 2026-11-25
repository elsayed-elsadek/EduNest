import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
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
    chats: [] as unknown[],
    messages: [] as unknown[],
    myEmail: 'mentor@example.com',
    unavailable: false,
    openConversation: vi.fn(),
    sendMessage: vi.fn(),
    handleEditMessage: vi.fn(),
    handleDeleteMessage: vi.fn(),
    markUnavailable: vi.fn(),
    clearUnavailable: vi.fn(),
    refetchConversations: vi.fn(),
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

vi.mock('../../../../components/layout/Dash-layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../../components/mentor-components/mentor-message-com/ChatList/ChatList', () => ({
  default: (props: unknown) => { chatListMock(props); return null; },
}));

vi.mock('../../../../components/mentor-components/mentor-message-com/ChatWindow/ChatWindow', () => ({
  default: (props: unknown) => { chatWindowMock(props); return null; },
}));

vi.mock('../../../../components/mentor-components/mentor-message-com/EmptyState/EmptyState', () => ({
  default: () => { emptyStateMock(); return null; },
}));

vi.mock('../../../../components/mentor-components/mentor-message-com/CreateRoomModal', () => ({
  default: () => null,
}));

vi.mock('../../../../components/mentor-components/mentor-message-com/RoomImageModal', () => ({
  default: () => null,
}));

vi.mock('../../../../hooks/Usedirectchat', () => ({ useDirectChat: () => directMock }));
vi.mock('../../../../hooks/Useroomchat', () => ({ useRoomChat: () => roomMock }));

import Messages from '../Messages';

const EXISTING_CHAT: Chat = {
  id: 'direct-conv-uuid',
  mode: 'direct',
  userId: 'student@example.com',
  userName: 'Existing Student',
  lastMessage: '',
  timestamp: '',
  unreadCount: 0,
  conversationId: 'conv-uuid',
};

beforeEach(() => {
  locationMock.state = null;
  directMock.loading = false;
  directMock.chats = [];
  directMock.messages = [];
  directMock.unavailable = false;
  directMock.myEmail = 'mentor@example.com';
  roomMock.loading = false;
  roomMock.rooms = [];
  roomMock.messages = [];
});

describe('INT-04 Batch 2 — mentor Messages direct navigation', () => {
  it('shows the generic unavailable state instead of fabricating a virtual chat', () => {
    locationMock.state = {
      openDirectChatWith: { email: 'new@example.com', name: 'Unknown Student' },
    };

    render(<Messages />);

    expect(directMock.markUnavailable).toHaveBeenCalledTimes(1);
    expect(directMock.openConversation).not.toHaveBeenCalled();
    expect(screen.getByText('This conversation is unavailable.')).toBeInTheDocument();
    expect(chatWindowMock).not.toHaveBeenCalled();

    const listProps = chatListMock.mock.calls.at(-1)?.[0] as {
      chats: Chat[];
      selectedChatId: string | null;
    };
    expect(listProps.chats).toEqual([]);
    expect(listProps.selectedChatId).toBeNull();
    expect(JSON.stringify(listProps)).not.toContain('direct-new-');
    expect(JSON.stringify(listProps)).not.toContain('new@example.com');
  });

  it('opens an existing conversation and keeps messaging functional', () => {
    locationMock.state = {
      openDirectChatWith: { email: 'STUDENT@EXAMPLE.COM', name: 'Existing Student' },
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

    act(() => { windowProps.onSendMessage('hello student'); });
    expect(directMock.sendMessage).toHaveBeenCalledWith(EXISTING_CHAT.userId, 'hello student');
  });

  it('passes the hook unavailable state to ChatWindow for history failures', () => {
    locationMock.state = {
      openDirectChatWith: { email: 'student@example.com', name: 'Existing Student' },
    };
    directMock.chats = [EXISTING_CHAT];
    directMock.unavailable = true;

    render(<Messages />);

    expect(chatWindowMock).toHaveBeenCalledWith(
      expect.objectContaining({ chat: EXISTING_CHAT, unavailable: true }),
    );
  });
});
