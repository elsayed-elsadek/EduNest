
import type { FC } from 'react';
import { useState } from 'react';
import DashLayout from '../../components/layout/Dash-layout'
import ChatList from '../../components/mentor-message-com/ChatList/ChatList'
import ChatWindow from '../../components/mentor-message-com/ChatWindow/ChatWindow'
import EmptyState from '../../components/mentor-message-com/EmptyState/EmptyState'
import type { Chat, Message } from '../../types/mentor-meaasges.types';

const Messages: FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const currentUserId = 'current-user';
  const currentUserAvatar = 'https://i.pravatar.cc/150?img=33';

  // Mock Chats Data
  const chats: Chat[] = [
    {
      id: '1',
      userId: 'user-1',
      userName: 'Adam West',
      userAvatar: 'https://i.pravatar.cc/150?img=12',
      lastMessage: '',
      lastMessageIcon: '❤️',
      timestamp: '4d',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Brian Griffin',
      userAvatar: 'https://i.pravatar.cc/150?img=13',
      lastMessage: 'Yay, this will be the best time of...',
      timestamp: '1w',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Marketplace',
      userAvatar: '',
      lastMessage: '',
      timestamp: '3w',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '4',
      userId: 'user-4',
      userName: 'Lois Griffin',
      userAvatar: 'https://i.pravatar.cc/150?img=44',
      lastMessage: 'Reacted 👍 to your message',
      timestamp: '5w',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: '5',
      userId: 'user-5',
      userName: 'Joe Swanson',
      userAvatar: 'https://i.pravatar.cc/150?img=14',
      lastMessage: 'Scott sent an attachment.',
      timestamp: '6w',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '6',
      userId: 'user-6',
      userName: 'Meg Griffin',
      userAvatar: 'https://i.pravatar.cc/150?img=45',
      lastMessage: 'You: Hey! Would Wynn like to co...',
      timestamp: '8w',
      unreadCount: 1,
      isOnline: false,
    },
    {
      id: '7',
      userId: 'user-7',
      userName: 'Cleveland Brown',
      userAvatar: 'https://i.pravatar.cc/150?img=15',
      lastMessage: '',
      timestamp: '10w',
      unreadCount: 0,
      isOnline: true,
    },
  ];

  // Mock Messages for Lois Griffin
  const messagesData: Record<string, Message[]> = {
    '4': [
      {
        id: 'm1',
        chatId: '4',
        senderId: 'user-4',
        content: 'Saturday still. Then here another week after that before I come home.',
        timestamp: '10:30 AM',
        isRead: true,
      },
      {
        id: 'm2',
        chatId: '4',
        senderId: 'user-4',
        content: 'Sure, Peter.',
        timestamp: '10:32 AM',
        isRead: true,
      },
      {
        id: 'm3',
        chatId: '4',
        senderId: currentUserId,
        content: 'Bird is the word.',
        timestamp: '10:35 AM',
        isRead: true,
        hasEmoji: '👍',
      },
      {
        id: 'm4',
        chatId: '4',
        senderId: 'user-4',
        content: 'Have you been drinking?',
        timestamp: '10:36 AM',
        isRead: true,
        hasEmoji: '👍',
      },
      {
        id: 'm5',
        chatId: '4',
        senderId: 'user-4',
        content: "Hahaha it's all good! I'm here another 10 days. Just house/dog sitting today through Saturday still. Then here another week after that before I come home.",
        timestamp: '10:40 AM',
        isRead: true,
      },
      {
        id: 'm6',
        chatId: '4',
        senderId: currentUserId,
        content: "Nice! Let's try and grab lunch next week. What's in Colorado for you?",
        timestamp: '10:42 AM',
        isRead: true,
      },
      {
        id: 'm7',
        chatId: '4',
        senderId: 'user-4',
        content: "Peter, you know my family lives here.",
        timestamp: '10:43 AM',
        isRead: true,
      },
      {
        id: 'm8',
        chatId: '4',
        senderId: 'user-4',
        content: "You're welcome to join me next time. It would be nice for you to see them. It's been years. But you need to behave...",
        timestamp: '10:45 AM',
        isRead: true,
      },
      {
        id: 'm9',
        chatId: '4',
        senderId: currentUserId,
        content: "Gosh, it's not like me to do anything crazy or stupid.",
        timestamp: '10:47 AM',
        isRead: true,
      },
      {
        id: 'm10',
        chatId: '4',
        senderId: 'user-4',
        content: 'Sure, Peter.',
        timestamp: '10:48 AM',
        isRead: true,
      },
      {
        id: 'm11',
        chatId: '4',
        senderId: currentUserId,
        content: 'Bird is the word.',
        timestamp: '10:50 AM',
        isRead: true,
        hasEmoji: '👍',
      },
      {
        id: 'm12',
        chatId: '4',
        senderId: 'user-4',
        content: 'Have you been drinking?',
        timestamp: '10:52 AM',
        isRead: true,
        hasEmoji: '👍',
      },
      {
        id: 'm13',
        chatId: '4',
        senderId: 'user-4',
        content: "Peter, did you rob a bunch of people on the beach with your metal detector? Please say no...",
        timestamp: '10:55 AM',
        isRead: true,
      },
      {
        id: 'm14',
        chatId: '4',
        senderId: currentUserId,
        content: "Well, that's only half the story 😂",
        timestamp: '10:56 AM',
        isRead: true,
      },
      {
        id: 'm15',
        chatId: '4',
        senderId: 'user-4',
        content: "Oh, I wouldn't worry about it, Peter. I've put Stewie in the oven a bunch of times. If you come to your senses within 15 minutes, everything's fine.",
        timestamp: '10:58 AM',
        isRead: true,
      },
      {
        id: 'm16',
        chatId: '4',
        senderId: currentUserId,
        content: "Sorry, I missed all that. I was tweeting.",
        timestamp: '11:00 AM',
        isRead: true,
        hasEmoji: '👍',
      },
    ],
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const messages = selectedChatId ? (messagesData[selectedChatId] || []) : [];

  const handleSendMessage = (content: string) => {
    console.log('Send message:', content);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  return (
    <DashLayout pageTitle="Messages">
      <div className="h-[calc(100vh-65px)] flex">
        {/* Chat List */}
        <div className={`
          w-full lg:w-80 xl:w-96 flex-shrink-0
          ${selectedChatId ? 'hidden lg:block' : 'block'}
        `}>
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
          />
        </div>

        {/* Chat Window / Empty State */}
        <div className={`
          flex-1
          ${!selectedChatId ? 'hidden lg:block' : 'block'}
        `}>
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              messages={messages}
              currentUserId={currentUserId}
              currentUserAvatar={currentUserAvatar}
              onSendMessage={handleSendMessage}
              onBack={handleBackToList}
              showBackButton={true}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </DashLayout>
  );
};

export default Messages;


