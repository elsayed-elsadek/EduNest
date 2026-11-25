import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Chat, Message } from '../../../../../types/mentor-meaasges.types';

vi.mock('../ChatHeader', () => ({
  default: ({ chat }: { chat: Chat }) => (
    <div data-testid="chat-header">{chat.userName}</div>
  ),
}));

vi.mock('../MessageBubble', () => ({
  default: ({ message }: { message: Message }) => <div>{message.content}</div>,
}));

vi.mock('../Memberspanel', () => ({ default: () => null }));

import ChatWindow from '../ChatWindow';

const CHAT: Chat = {
  id: 'direct-conv-uuid',
  mode: 'direct',
  userId: 'student@example.com',
  userName: 'Private Participant',
  lastMessage: '',
  timestamp: '',
  unreadCount: 0,
  conversationId: 'conv-uuid',
};

const MESSAGES: Message[] = [{
  id: 'msg-uuid',
  chatId: 'conv-uuid',
  senderId: 'student@example.com',
  senderName: 'Private Participant',
  content: 'SECRET MESSAGE BODY',
  timestamp: '',
  isRead: true,
}];

describe('INT-04 Batch 2 — mentor ChatWindow unavailable state', () => {
  it('shows only the generic message and disables the composer', () => {
    const onSend = vi.fn();

    render(
      <ChatWindow
        chat={CHAT}
        messages={MESSAGES}
        currentUserId="mentor@example.com"
        onSendMessage={onSend}
        unavailable
      />,
    );

    expect(screen.getByText('This conversation is unavailable.')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-header')).not.toBeInTheDocument();
    expect(screen.queryByText('Private Participant')).not.toBeInTheDocument();
    expect(screen.queryByText('SECRET MESSAGE BODY')).not.toBeInTheDocument();

    const textbox = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: 'Send message' });
    expect(textbox).toBeDisabled();
    expect(sendButton).toBeDisabled();

    fireEvent.change(textbox, { target: { value: 'should not send' } });
    fireEvent.click(sendButton);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('keeps accessible conversations working normally', () => {
    const onSend = vi.fn();

    render(
      <ChatWindow
        chat={CHAT}
        messages={MESSAGES}
        currentUserId="mentor@example.com"
        onSendMessage={onSend}
      />,
    );

    expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    expect(screen.getByText('SECRET MESSAGE BODY')).toBeInTheDocument();
    expect(screen.queryByText('This conversation is unavailable.')).not.toBeInTheDocument();

    const textbox = screen.getByRole('textbox');
    expect(textbox).toBeEnabled();
    fireEvent.change(textbox, { target: { value: 'hello student' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSend).toHaveBeenCalledWith('hello student');
  });
});
