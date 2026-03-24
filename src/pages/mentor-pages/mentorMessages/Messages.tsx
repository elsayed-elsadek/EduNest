
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import DashLayout      from '../../../components/layout/Dash-layout';
import ChatList        from '../../../components/mentor-components/mentor-message-com/ChatList/ChatList';
import ChatWindow      from '../../../components/mentor-components/mentor-message-com/ChatWindow/ChatWindow';
import EmptyState      from '../../../components/mentor-components/mentor-message-com/EmptyState/EmptyState';
import CreateRoomModal from '../../../components/mentor-components/mentor-message-com/CreateRoomModal';
import RoomImageModal  from '../../../components/mentor-components/mentor-message-com/RoomImageModal';
import { useDirectChat } from '../../../hooks/Usedirectchat';
import { useRoomChat   } from '../../../hooks/Useroomchat';
import type { Chat, ChatTab } from '../../../types/mentor-meaasges.types';

interface OpenChatState {
  openDirectChatWith?: { email: string; name: string; avatar?: string; };
}

const Messages = () => {
  const location = useLocation();
  const direct   = useDirectChat();
  const room     = useRoomChat();

  const [activeTab,      setActiveTab     ] = useState<ChatTab>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom ] = useState(false);
  const [showRoomImage,  setShowRoomImage  ] = useState(false);

  const virtualTargetEmailRef = useRef<string | null>(null);

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
        id: virtualId, mode: 'direct', userId: email,
        userName: name, userAvatar: avatar,
        lastMessage: '', timestamp: '', unreadCount: 0,
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

  const chatList = activeTab === 'chats' ? direct.chats : room.rooms;

  const activeItem: Chat | null = (() => {
    if (!selectedChatId) return null;
    const real = chatList.find(c => c.id === selectedChatId);
    if (real) return real;
    const state = location.state as OpenChatState | null;
    const info = state?.openDirectChatWith;
    if (info && selectedChatId === `direct-new-${info.email}`) {
      return {
        id: selectedChatId, mode: 'direct', userId: info.email,
        userName: info.name, userAvatar: info.avatar,
        lastMessage: '', timestamp: '', unreadCount: 0,
      };
    }
    return null;
  })();

  const messages = activeTab === 'chats' ? direct.messages  : room.messages;
  const myEmail  = activeTab === 'chats' ? direct.myEmail   : room.myEmail;

  const handleSelectChat = (chatId: string) => {
    virtualTargetEmailRef.current = null;
    setSelectedChatId(chatId);
    if (activeTab === 'chats') {
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
    virtualTargetEmailRef.current = null;
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !activeItem) return;
    if (activeTab === 'chats') {
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
    virtualTargetEmailRef.current = null;
  };

  const handleDeleteRoom = async () => {
    if (!activeItem?.roomId) return;
    await room.handleDeleteRoom(activeItem.roomId);
    setSelectedChatId(null);
  };

  return (
    <DashLayout pageTitle="Messages">
      <div className="flex h-[calc(100vh-65px)] overflow-hidden">

        <div
          className={`flex-shrink-0 w-full lg:w-80 xl:w-96 flex flex-col border-r border-gray-200
            ${selectedChatId ? 'hidden lg:flex' : 'flex'}`}
          style={{ height: '100%', minHeight: 0 }}
        >
          <ChatList
            chats={chatList}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onCreateRoom={() => setShowCreateRoom(true)}
          />
        </div>

        {/* ✅ التغيير الوحيد: أضفنا min-w-0 هنا */}
        <div
          className={`flex-1 min-w-0 flex flex-col ${!selectedChatId ? 'hidden lg:flex' : 'flex'}`}
          style={{ height: '100%', minHeight: 0 }}
        >
          {activeItem ? (
            <ChatWindow
              chat={activeItem}
              messages={messages}
              currentUserId={myEmail}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              showBackButton={true}
              onEditMessage={
                activeTab === 'chats' ? direct.handleEditMessage : room.handleEditMessage
              }
              onDeleteMessage={
                activeTab === 'chats' ? direct.handleDeleteMessage : room.handleDeleteMessage
              }
              onRoomImageClick={
                activeTab === 'groups' && activeItem.roomId
                  ? () => setShowRoomImage(true)
                  : undefined
              }
              onDeleteRoom={activeTab === 'groups' ? handleDeleteRoom : undefined}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreated={room.refetchRooms}
        />
      )}

      {showRoomImage && activeItem?.roomId && (
        <RoomImageModal
          roomId={activeItem.roomId}
          roomName={activeItem.userName}
          currentImage={activeItem.userAvatar}
          onClose={() => setShowRoomImage(false)}
          onUpdated={(newUrl) => {
            room.handleUpdateRoomImage(activeItem.roomId!, newUrl);
            setShowRoomImage(false);
          }}
        />
      )}
    </DashLayout>
  );
};

export default Messages;