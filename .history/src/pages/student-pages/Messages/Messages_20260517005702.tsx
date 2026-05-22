
import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../../components/student-components/common/Navbar/Navbar';
import Footer from '../../../components/student-components/common/Footer/Footer';
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
}

const Messages: FC = () => {
  const location = useLocation();
  const direct = useDirectChat();
  const room = useRoomChat();

  const [activeTab, setActiveTab] = useState<ChatTab>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const virtualTargetEmailRef = useRef<string | null>(null);
  const isRoomTab = activeTab !== 'chats';

  useEffect(() => {
    const state = location.state as OpenChatState | null;
    if (!state?.openDirectChatWith) return;
    if (direct.loading) return;

    const { email, name, avatar } = state.openDirectChatWith;
    const existing = direct.chats.find(c => c.userId === email);

    if (existing) {
      setActiveTab('chats');
      setSelectedChatId(existing.id);
      direct.openConversation(existing);
      virtualTargetEmailRef.current = null;
    } else {
      virtualTargetEmailRef.current = email;
      const virtualId = `direct-new-${email}`;
      setActiveTab('chats');
      setSelectedChatId(virtualId);
      direct.openConversation({
        id: virtualId,
        mode: 'direct',
        userId: email,
        userName: name,
        userAvatar: avatar,
        lastMessage: '',
        timestamp: '',
        unreadCount: 0,
      });
    }

    window.history.replaceState({}, '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, direct.loading]);

  useEffect(() => {
    const targetEmail = virtualTargetEmailRef.current;
    if (!targetEmail) return;
    const realConv = direct.chats.find(c => c.userId === targetEmail);
    if (realConv) {
      virtualTargetEmailRef.current = null;
      setSelectedChatId(realConv.id);
      direct.openConversation(realConv);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direct.chats]);

  const rawChatList: Chat[] = isRoomTab ? room.rooms : direct.chats;

  // ── Mentorship filter tags (groups only) ─────────────────────────────────
  const mentorshipTags = isRoomTab
    ? Array.from(
        new Set(
          room.rooms
            .map(r => r.mentorshipName ?? (r.mentorshipId ? `#${r.mentorshipId}` : null))
            .filter(Boolean) as string[]
        )
      )
    : [];

  const activeItem: Chat | null = (() => {
    if (!selectedChatId) return null;
    const real = rawChatList.find(c => c.id === selectedChatId);
    if (real) return real;
    const state = location.state as OpenChatState | null;
    const info = state?.openDirectChatWith;
    if (info && selectedChatId === `direct-new-${info.email}`) {
      return {
        id: selectedChatId,
        mode: 'direct',
        userId: info.email,
        userName: info.name,
        userAvatar: info.avatar,
        lastMessage: '',
        timestamp: '',
        unreadCount: 0,
      };
    }
    return null;
  })();

  const messages = isRoomTab ? room.messages : direct.messages;
  const myEmail  = isRoomTab ? room.myEmail  : direct.myEmail;

  const handleSelectChat = (chatId: string) => {
    virtualTargetEmailRef.current = null;
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
    virtualTargetEmailRef.current = null;
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !activeItem) return;
    if (!isRoomTab) {
      direct.sendMessage(activeItem.userId, content);
      if (selectedChatId?.startsWith('direct-new-')) {
        virtualTargetEmailRef.current = activeItem.userId;
        setTimeout(() => direct.refetchConversations(), 1500);
      }
    } else if (activeItem.roomId) {
      room.sendMessage(activeItem.roomId, content);
    }
  };

  const handleBack = () => {
    setSelectedChatId(null);
    setShowMembers(false);
    virtualTargetEmailRef.current = null;
  };

  const handleDeleteRoom = async () => {
    if (!activeItem?.roomId) return;
    await room.handleDeleteRoom(activeItem.roomId);
    setSelectedChatId(null);
    setShowMembers(false);
  };

  const handleToggleMembers = () => setShowMembers(prev => !prev);

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col">
      <Navbar />

<<<<<<< HEAD
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
=======
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden ">
>>>>>>> Student-role
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">

          {/* ── Frame Header ── */}
          <div className="bg-[#0c2d48] px-6 py-4">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">
              Student Portal
            </p>
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <p className="text-xs text-white/55 mt-1">
              Connect and collaborate with your mentors and peers.
            </p>
          </div>

          {/* ── Content Layout ── */}
<<<<<<< HEAD
          <div className="flex-1 flex overflow-hidden">

            {/* ── Chat List Sidebar ── */}
            <div
              className={`flex-shrink-0 w-full lg:w-80 xl:w-96 flex flex-col border-r border-gray-200
=======
          <div className="flex-1 flex overflow-hidden ">

            {/* ── Chat List Sidebar ── */}
            <div
              className={`flex-shrink-0 w-full lg:w-80 xl:w-96 flex flex-col border-r border-gray-200 
>>>>>>> Student-role
                ${selectedChatId ? 'hidden lg:flex' : 'flex'}`}
              style={{ height: '100%', minHeight: 0 }}
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
<<<<<<< HEAD
              className={`flex-1 min-w-0 flex flex-col relative
=======
              className={`flex-1 min-w-0 flex flex-col relative 
>>>>>>> Student-role
                ${!selectedChatId ? 'hidden lg:flex' : 'flex'}`}
              style={{ height: '100%', minHeight: 0 }}
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

      <Footer />
    </div>
  );
};

export default Messages;