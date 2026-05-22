import { useState, useRef, useEffect } from 'react';
import type { FC, KeyboardEvent } from 'react';
import { Send, Paperclip, ThumbsUp, Smile, X, Image } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

/* ─── Emoji data ─────────────────────────────────────────────────────────── */
const EMOJI_CATEGORIES = [
  {
    label: '😊 Smileys',
    emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃',
             '😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','😝',
             '🤑','🤗','🤩','🤔','🤨','😐','😑','😶','😏','😒','🙄','😬',
             '🤥','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵',
             '🥶','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️',
             '😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭',
             '😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬'],
  },
  {
    label: '👋 People',
    emojis: ['👋','🤚','🖐️','✋','🖖','👌','🤌','✌️','🤞','🤟','🤘','🤙',
             '👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜',
             '👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿',
             '🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁️',
             '👅','👄','🫦','🫂','👶','🧒','👦','👧','🧑','👱','👨','🧔'],
  },
  {
    label: '❤️ Hearts',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕',
             '💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️',
             '✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌',
             '♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️'],
  },
  {
    label: '🎉 Fun',
    emojis: ['🎉','🎊','🎈','🎁','🎀','🎗️','🎟️','🎫','🏆','🥇','🥈','🥉',
             '🏅','🎖️','🎪','🤹','🎭','🎨','🎬','🎤','🎧','🎼','🎵','🎶',
             '🥁','🎷','🎸','🎹','🎺','🎻','🪕','🎮','🕹️','🎲','♟️','🎯',
             '🎳','🎰','🎱','🏋️','⚽','🏀','🏈','⚾','🥎','🏐','🏉','🎾'],
  },
  {
    label: '🌿 Nature',
    emojis: ['🌸','🌺','🌻','🌹','🌷','🌱','🌿','🍀','🍁','🍂','🍃','🌾',
             '🍄','🌵','🌴','🌳','🌲','🎋','🎍','🐶','🐱','🐭','🐹','🐰',
             '🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉',
             '🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴'],
  },
  {
    label: '🍕 Food',
    emojis: ['🍕','🍔','🌭','🥪','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲',
             '🍜','🍝','🍠','🍢','🍣','🍤','🍙','🍚','🍛','🍱','🥟','🦪',
             '🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭',
             '🍮','🍯','🍼','🥛','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻'],
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
const MessageInput: FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [message, setMessage]           = useState('');
  const [showEmoji, setShowEmoji]       = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [previewFile, setPreviewFile]   = useState<{ name: string; url: string; type: string } | null>(null);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const emojiRef     = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* close emoji picker on outside click */
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  /* auto-grow textarea */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [message]);

  const handleSend = () => {
    if (disabled) return;
    if (previewFile) {
      onSend(`📎 ${previewFile.name}`);
      setPreviewFile(null);
      return;
    }
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) { setMessage(prev => prev + emoji); return; }
    const start = ta.selectionStart ?? message.length;
    const end   = ta.selectionEnd   ?? message.length;
    const next  = message.slice(0, start) + emoji + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const sendLike = () => {
    if (!disabled) onSend('👍');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewFile({ name: file.name, url, type: file.type });
    e.target.value = '';
  };

  const isImage = previewFile?.type.startsWith('image/');
  const canSend = !disabled && (message.trim().length > 0 || !!previewFile);

  return (
    <div className="bg-white border-t border-gray-200">
      {/* ── File preview strip ── */}
      {previewFile && (
        <div className="px-4 pt-3 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-0">
            {isImage ? (
              <img src={previewFile.url} alt="preview"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#0c2d48]/10 flex items-center justify-center flex-shrink-0">
                <Paperclip className="w-5 h-5 text-[#0c2d48]" />
              </div>
            )}
            <span className="text-sm text-gray-700 truncate">{previewFile.name}</span>
          </div>
          <button
            onClick={() => setPreviewFile(null)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Input row ── */}
      <div className="p-3 flex items-end gap-2">

        {/* Attachment */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach file"
          className="p-2 text-gray-400 hover:text-[#0c2d48] transition-colors disabled:opacity-40 flex-shrink-0 rounded-lg hover:bg-gray-100"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Image shortcut */}
        <button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = 'image/*';
              fileInputRef.current.click();
              setTimeout(() => {
                if (fileInputRef.current)
                  fileInputRef.current.accept = 'image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt';
              }, 1000);
            }
          }}
          disabled={disabled}
          title="Send image"
          className="p-2 text-gray-400 hover:text-[#0c2d48] transition-colors disabled:opacity-40 flex-shrink-0 rounded-lg hover:bg-gray-100"
        >
          <Image className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <div className="relative flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={disabled}
            rows={1}
            className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#0c2d48]/30 focus:border-[#0c2d48]/40
              disabled:opacity-50 disabled:cursor-not-allowed resize-none  transition-all overflow-hidden scrollbar-none"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Emoji */}
        <div ref={emojiRef} className="relative flex-shrink-0">
          <button
            onClick={() => setShowEmoji(prev => !prev)}
            disabled={disabled}
            title="Emoji"
            className={`p-2 transition-colors disabled:opacity-40 rounded-lg hover:bg-gray-100
              ${showEmoji ? 'text-[#0c2d48]' : 'text-gray-400 hover:text-[#0c2d48]'}`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Emoji Picker Popup */}
          {showEmoji && (
            <div className="absolute bottom-full right-0 mb-2 z-50 w-[320px] bg-white rounded-2xl shadow-2xl
              border border-gray-200 overflow-hidden"
              style={{ maxHeight: '340px' }}
            >
              {/* Category tabs */}
              <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50"
                style={{ scrollbarWidth: 'none' }}>
                {EMOJI_CATEGORIES.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCategory(i)}
                    className={`flex-shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors
                      ${activeCategory === i
                        ? 'text-[#0c2d48] border-b-2 border-[#0c2d48] bg-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  >
                    {cat.label.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Emoji grid */}
              <div className="overflow-y-auto p-2" style={{ maxHeight: '270px', scrollbarWidth: 'thin' }}>
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => insertEmoji(emoji)}
                      className="w-9 h-9 flex items-center justify-center text-xl rounded-lg
                        hover:bg-gray-100 transition-colors cursor-pointer"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Send / Like */}
        {canSend ? (
          <button
            onClick={handleSend}
            disabled={!canSend}
            title="Send"
            className="p-2.5 bg-[#0c2d48] text-white rounded-xl hover:bg-[#083a62] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md
              hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={sendLike}
            disabled={disabled}
            title="Send like"
            className="p-2.5 text-[#0c2d48] hover:text-white hover:bg-[#0c2d48] rounded-xl transition-all
              disabled:opacity-40 flex-shrink-0 border border-[#0c2d48]/20 hover:border-transparent
              hover:shadow-md hover:scale-105 active:scale-95"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;