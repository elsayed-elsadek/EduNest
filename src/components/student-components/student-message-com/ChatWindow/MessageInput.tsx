import type { FC, KeyboardEvent } from 'react';
import { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MessageInput: FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-end gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c2d48] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          style={{
            minHeight: '40px',
            maxHeight: '120px',
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="p-2.5 bg-[#0c2d48] text-white rounded-lg hover:bg-[#083a62] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;