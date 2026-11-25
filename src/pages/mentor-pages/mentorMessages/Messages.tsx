
import { useState, useEffect } from 'react';
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

const DIRECT_CHAT_UNAVAILABLE_MESSAGE = 'This conversation is unavailable.';

const Messages = () => {
  const location = useLocation();
  const direct   = useDirectChat();
  const room     = useRoomChat();

  const [activeTab,      setActiveTab     ] = useState<ChatTab>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom ] = useState(false);
  const [showRoomImage,  setShowRoomImage  ] = useState(false);
  const [directNavUnavailable, setDirectNavUnavailable] = useState(false);

  useEffect(() => {
    const state = location.state as OpenChatState | null;
    if (!state?.openDirectChatWith) return;
    if (direct.loading) return;

    const requestedEmail = state.openDirectChatWith.email.toLowerCase().trim();
    const existing = direct.chats.find(
      c => c.userId.toLowerCase().trim() === requestedEmail
    );

    setActiveTab('chats');
    if (existing) {
      setDirectNavUnavailable(false);
      direct.clearUnavailable();
      setSelectedChatId(existing.id);
      direct.openConversation(existing);
    } else {
      // No existing conversation: show the same generic unavailable state.
      // Never build a conversation object or id from the email alone.
      setDirectNavUnavailable(true);
      direct.markUnavailable();
      setSelectedChatId(null);
    }

    window.history.replaceState({}, '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, direct.loading]);

  const chatList = activeTab === 'chats' ? direct.chats : room.rooms;

  const activeItem: Chat | null = selectedChatId
    ? chatList.find(c => c.id === selectedChatId) ?? null
    : null;

  const messages = activeTab === 'chats' ? direct.messages  : room.messages;
  const myEmail  = activeTab === 'chats' ? direct.myEmail   : room.myEmail;
  const directUnavailable = activeTab === 'chats' && (directNavUnavailable || direct.unavailable);

  const handleSelectChat = (chatId: string) => {
    setDirectNavUnavailable(false);
    direct.clearUnavailable();
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
    setDirectNavUnavailable(false);
    direct.clearUnavailable();
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !activeItem || direct.unavailable) return;
    if (activeTab === 'chats') {
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
    setDirectNavUnavailable(false);
    direct.clearUnavailable();
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
              unavailable={directUnavailable}
            />
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