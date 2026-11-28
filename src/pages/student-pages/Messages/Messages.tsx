
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import {
  ChatList,
  ChatWindow,
  EmptyState,
} from '../../../components/student-components/student-message-com';
import CreateRoomModal from '../../../components/student-components/student-message-com/CreateRoomModal';
import MembersPanel from '../../../components/student-components/student-message-com/MembersPanel';
import { useDirectChat } from '../../../hooks/Usedirectchat';
import { useRoomChat } from '../../../hooks/Useroomchat';
import type { Chat, ChatTab } from '../../../types/mentor-meaasges.types';

interface OpenChatState {
  openDirectChatWith?: { email: string; name: string; avatar?: string };
  openRoomById?: { roomId: number; roomName: string; coverImage?: string };
}

const DIRECT_CHAT_UNAVAILABLE_MESSAGE = 'This conversation is unavailable.';
const PENDING_DIRECT_CHAT_ID = 'pending-direct-chat';

const Messages: FC = () => {
  const location = useLocation();
  const direct = useDirectChat();
  const room = useRoomChat();

  const [activeTab, setActiveTab] = useState<ChatTab>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [directNavUnavailable, setDirectNavUnavailable] = useState(false);
  const [pendingDirectChat, setPendingDirectChat] = useState<OpenChatState['openDirectChatWith'] | null>(null);

  const isRoomTab = activeTab !== 'chats';

  useEffect(() => {
    const state = location.state as OpenChatState | null;

    // --- Open room by id (groups) ---
    if (state?.openRoomById) {
      if (room.loading) return;
      const { roomId, roomName, coverImage } = state.openRoomById;
      const roomIdStr = `room-${roomId}`;
      const existing = room.rooms.find(r => r.id === roomIdStr || r.roomId === roomId);

      setActiveTab('groups');
      setDirectNavUnavailable(false);
      direct.clearUnavailable();
      direct.cancelPendingDirectChat();
      setPendingDirectChat(null);
      if (existing) {
        setSelectedChatId(existing.id);
        room.openRoom(existing);
      } else {
        const virtualRoom = {
          id: roomIdStr,
          mode: 'room' as const,
          userId: String(roomId),
          userName: roomName,
          userAvatar: coverImage ?? undefined,
          lastMessage: '',
          timestamp: '',
          unreadCount: 0,
          roomId,
        } as Chat;
        setSelectedChatId(roomIdStr);
        room.openRoom(virtualRoom);
      }
      window.history.replaceState({}, '');
      return;
    }

    // --- Open direct chat if requested ---
    if (!state?.openDirectChatWith) return;
    // The conversation list starts empty. Deciding availability before it has
    // loaded would clear the navigation state and strand the requested chat.
    if (direct.loading || !direct.conversationsLoaded) return;

    const requestedEmail = state.openDirectChatWith.email.toLowerCase().trim();
    const existing = direct.chats.find(
      c => c.userId.toLowerCase().trim() === requestedEmail
    );

    setActiveTab('chats');
    if (existing) {
      setDirectNavUnavailable(false);
      direct.clearUnavailable();
      direct.cancelPendingDirectChat();
      setPendingDirectChat(null);
      setSelectedChatId(existing.id);
      direct.openConversation(existing);
    } else {
      // No conversation yet. The backend creates one lazily on the first
      // private message, so keep the recipient as a pending target and let the
      // realtime response supply the real conversation id.
      setDirectNavUnavailable(false);
      direct.clearUnavailable();
      direct.beginPendingDirectChat(requestedEmail);
      setPendingDirectChat(state.openDirectChatWith);
      setSelectedChatId(PENDING_DIRECT_CHAT_ID);
    }

    window.history.replaceState({}, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, direct.loading, direct.conversationsLoaded, room.loading]);

  useEffect(() => {
    const resolved = direct.pendingResolvedChat;
    if (!resolved) return;
    setPendingDirectChat(null);
    setSelectedChatId(resolved.id);
    direct.clearPendingResolvedChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direct.pendingResolvedChat, direct.clearPendingResolvedChat]);

  const rawChatList: Chat[] = isRoomTab ? room.rooms : direct.chats;

  const mentorshipTags = isRoomTab
    ? Array.from(
        new Set(
          room.rooms
            .map(r => r.mentorshipName ?? (r.mentorshipId ? `#${r.mentorshipId}` : null))
            .filter(Boolean) as string[]
        )
      )
    : [];

  const pendingChat: Chat | null = pendingDirectChat ? {
    id: PENDING_DIRECT_CHAT_ID,
    mode: 'direct',
    userId: pendingDirectChat.email,
    userName: pendingDirectChat.name,
    userAvatar: pendingDirectChat.avatar,
    lastMessage: '',
    timestamp: '',
    unreadCount: 0,
  } : null;

  const activeItem: Chat | null = selectedChatId === PENDING_DIRECT_CHAT_ID
    ? pendingChat
    : selectedChatId
      ? rawChatList.find(c => c.id === selectedChatId) ?? null
      : null;

  const messages = isRoomTab ? room.messages : direct.messages;
  const myEmail = isRoomTab ? room.myEmail : direct.myEmail;
  const directUnavailable = !isRoomTab && (directNavUnavailable || direct.unavailable);

  const handleSelectChat = (chatId: string) => {
    setDirectNavUnavailable(false);
    direct.clearUnavailable();
    direct.cancelPendingDirectChat();
    setPendingDirectChat(null);
    setSelectedChatId(chatId);
    setShowMembers(false);
    if (!isRoomTab) {
      const chat = direct.chats.find(c => c.id === chatId);
      if (chat) direct.openConversation(chat);
    } else {
      const r = room.rooms.find(r => r.id === chatId);
      if (r) room.openRoom(r);
    }
  };

  const handleTabChange = (tab: ChatTab) => {
    setActiveTab(tab);
    setSelectedChatId(null);
    setShowMembers(false);
    setDirectNavUnavailable(false);
    direct.clearUnavailable();
    direct.cancelPendingDirectChat();
    setPendingDirectChat(null);
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || direct.unavailable) return;
    if (pendingDirectChat) {
      // First message: the backend creates the conversation and returns its
      // real id on /user/queue/messages; no local conversation is invented.
      direct.sendMessage(pendingDirectChat.email, content);
      return;
    }
    if (!activeItem) return;
    if (!isRoomTab) {
      // A real conversation id must exist before sending; email alone is not
      // a substitute for a conversation identifier.
      if (!activeItem.conversationId) return;
      direct.sendMessage(activeItem.userId, content);
    } else if (activeItem.roomId) {
      room.sendMessage(activeItem.roomId, content);
    }
  };

  const handleBack = () => {
    setSelectedChatId(null);
    setShowMembers(false);
    setDirectNavUnavailable(false);
    direct.clearUnavailable();
    direct.cancelPendingDirectChat();
    setPendingDirectChat(null);
  };

  const handleDeleteRoom = async () => {
    if (!activeItem?.roomId) return;
    await room.handleDeleteRoom(activeItem.roomId);
    setSelectedChatId(null);
    setShowMembers(false);
  };

  const handleToggleMembers = () => setShowMembers(prev => !prev);

  return (
    <div className="h-screen bg-[#F7F7F8] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">

          {/* ── Frame Header ── */}
          <div className="bg-[#0c2d48] px-6 py-3 flex-shrink-0">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">
              Student Portal
            </p>
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <p className="text-xs text-white/55 mt-1">
              Connect and collaborate with your mentors and peers.
            </p>
          </div>

          {/* ── Content Layout ── */}
          <div className="flex-1 flex overflow-hidden min-h-0">

            {/* ── Chat List Sidebar ── */}
            <div
              className={`flex-shrink-0 w-full lg:w-80 xl:w-96 flex flex-col border-r border-gray-200
                ${selectedChatId ? 'hidden lg:flex' : 'flex'}`}
            >
              <ChatList
                chats={rawChatList}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                mentorshipTags={mentorshipTags}
              />
            </div>

            {/* ── Chat Window ── */}
            <div
              className={`flex-1 min-w-0 flex flex-col relative
                ${!selectedChatId ? 'hidden lg:flex' : 'flex'}`}
            >
              {activeItem ? (
                <>
                  <ChatWindow
                    chat={activeItem}
                    messages={messages}
                    currentUserId={myEmail}
                    onSendMessage={handleSendMessage}
                    onBack={handleBack}
                    showBackButton={true}
                    onEditMessage={
                      isRoomTab ? room.handleEditMessage : direct.handleEditMessage
                    }
                    onDeleteMessage={
                      isRoomTab ? room.handleDeleteMessage : direct.handleDeleteMessage
                    }
                    onViewMembers={
                      isRoomTab && activeItem.roomId
                        ? handleToggleMembers
                        : undefined
                    }
                    isMembersOpen={showMembers}
                    unavailable={directUnavailable}
                  />

                  {showMembers && activeItem.roomId && (
                    <MembersPanel
                      roomId={activeItem.roomId}
                      roomName={activeItem.userName}
                      creatorEmail={activeItem.creatorEmail}
                      myEmail={myEmail}
                      onClose={() => setShowMembers(false)}
                      onDeleteRoom={isRoomTab ? handleDeleteRoom : undefined}
                    />
                  )}
                </>
              ) : directUnavailable ? (
                <div
                  role="status"
                  className="flex-1 flex items-center justify-center px-6 py-4 bg-[#FAFAFA]"
                >
                  <p className="text-sm text-gray-600 text-center">
                    {DIRECT_CHAT_UNAVAILABLE_MESSAGE}
                  </p>
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </main>

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreated={room.refetchRooms}
        />
      )}
    </div>
  );
};

export default Messages;