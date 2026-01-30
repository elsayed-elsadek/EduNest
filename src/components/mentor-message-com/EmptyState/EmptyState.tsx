
import type { FC } from 'react';

const EmptyState: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-8">
      <div className="w-24 h-24 bg-[#E8F3FF] rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-[#2D9CDB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
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