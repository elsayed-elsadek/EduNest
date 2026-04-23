import type { FC } from 'react';
import { MessageSquare } from 'lucide-react';

const EmptyState: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-8">
      <div className="w-24 h-24 bg-[#0c2d48]/10 rounded-full flex items-center justify-center mb-6">
        <MessageSquare className="w-12 h-12 text-[#0c2d48]" />
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