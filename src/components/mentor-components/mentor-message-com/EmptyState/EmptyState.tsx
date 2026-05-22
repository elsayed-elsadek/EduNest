
import type { FC } from 'react';
import { MessageCircle } from 'lucide-react';

const EmptyState: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-8">
      <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
        <MessageCircle className="w-12 h-12 text-blue-500 dark:text-blue-400" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Select a conversation
      </h3>

      <p className="text-sm text-gray-500 text-center max-w-sm">
        Choose a chat from the list to start messaging
      </p>
    </div>
  );
};

export default EmptyState;


