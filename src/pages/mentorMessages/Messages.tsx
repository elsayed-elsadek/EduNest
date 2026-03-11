
import { useState } from 'react';
import DashLayout      from '../../components/layout/Dash-layout';
import ChatList        from '../../components/mentor-message-com/ChatList/ChatList';
import ChatWindow      from '../../components/mentor-message-com/ChatWindow/ChatWindow';
import EmptyState      from '../../components/mentor-message-com/EmptyState/EmptyState';
import CreateRoomModal from '../../components/mentor-message-com/CreateRoomModal';
import RoomImageModal  from '../../components/mentor-message-com/RoomImageModal';
import { useDirectChat } from '../../hooks/Usedirectchat';
import { useRoomChat   } from '../../hooks/Useroomchat';
import type { ChatTab } from '../../types/mentor-meaasges.types';

const Messages = () => {
  const direct = useDirectChat();
  const room   = useRoomChat();

  const [activeTab,      setActiveTab     ] = useState<ChatTab>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showRoomImage,  setShowRoomImage ] = useState(false);

  const chatList   = activeTab === 'chats' ? direct.chats : room.rooms;
  const activeItem = chatList.find(c => c.id === selectedChatId) ?? null;
  const messages   = activeTab === 'chats' ? direct.messages  : room.messages;
  const myEmail    = activeTab === 'chats' ? direct.myEmail   : room.myEmail;

  const handleSelectChat = (chatId: string) => {
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
  };

  const handleSendMessage = (content: string) => {
    if (!activeItem || !content.trim()) return;
    if (activeTab === 'chats') {
      direct.sendMessage(activeItem.userId, content);
    } else if (activeItem.roomId) {
      room.sendMessage(activeItem.roomId, content);
    }
  };

  const handleBack = () => setSelectedChatId(null);

  return (
    <DashLayout pageTitle="Messages">
      <div className="h-[calc(100vh-65px)] flex">

        {/* Sidebar */}
        <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 ${selectedChatId ? 'hidden lg:block' : 'block'}`}>
          <ChatList
            chats={chatList}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onCreateRoom={() => setShowCreateRoom(true)}
          />
        </div>

        {/* Chat Window */}
        <div className={`flex-1 ${!selectedChatId ? 'hidden lg:block' : 'block'}`}>
          {activeItem ? (
            <ChatWindow
              chat={activeItem}
              messages={messages}
              currentUserId={myEmail}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              showBackButton={true}
              // ↓ optional new props — add to ChatWindowProps if not there yet
              onEditMessage={activeTab === 'chats' ? direct.handleEditMessage    : undefined}
              onDeleteMessage={activeTab === 'chats' ? direct.handleDeleteMessage : undefined}
              onRoomImageClick={
                activeTab === 'groups' && activeItem.roomId
                  ? () => setShowRoomImage(true)
                  : undefined
              }
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreated={room.refetchRooms}
        />
      )}

      {/* Room Image Modal */}
      {showRoomImage && activeItem?.roomId && (
        <RoomImageModal
          roomId={activeItem.roomId}
          roomName={activeItem.userName}
          currentImage={activeItem.userAvatar}
          onClose={() => setShowRoomImage(false)}
          onUpdated={(newUrl) => {
            // Update local state in hook — no extra API call
            room.handleUpdateRoomImage(activeItem.roomId!, newUrl);
            setShowRoomImage(false);
          }}
        />
      )}
    </DashLayout>
  );
};

export default Messages;