
import { type FC, useState, useRef, useEffect } from 'react';
import { X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { useChatbot } from '../../../hooks/chatbot/Usechatbot';
import { useAuthStore } from '../../../store/authStore';
import { formatBotText } from '../../../utils/formatBotText';

// ─── Bot face SVG (trigger button) ───────────────────────────────────────────
const BotFaceIcon: FC = () => (
  <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
    <rect x="5" y="9" width="26" height="20" rx="7"
      fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth="1.3" />
    <line x1="18" y1="9" x2="18" y2="4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="18" cy="3.5" r="1.5" fill="white" />
    <circle cx="13" cy="19" r="3" fill="white" />
    <circle cx="23" cy="19" r="3" fill="white" />
    <circle cx="13" cy="19" r="1.3" fill="#0f5e8b" className="bot-pupil" />
    <circle cx="23" cy="19" r="1.3" fill="#0f5e8b" className="bot-pupil" />
    <path d="M13 26 Q18 29.5 23 26" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
  </svg>
);

// ─── Large bot avatar (expanded header)
const BotLargeAvatar: FC = () => (
  <div
    className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center mx-auto"
    style={{ background: 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)' }}
  >
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <rect x="4" y="10" width="32" height="22" rx="8"
        fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5" />
      <line x1="20" y1="10" x2="20" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="4" r="2" fill="white" />
      <circle cx="13" cy="21" r="3.5" fill="white" />
      <circle cx="27" cy="21" r="3.5" fill="white" />
      <circle cx="13" cy="21" r="1.5" fill="#0f5e8b" />
      <circle cx="27" cy="21" r="1.5" fill="#0f5e8b" />
      <path d="M13 30 Q20 34 27 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

// ─── Small bot avatar (compact messages) ─────────────────────────────────────
const BotMiniAvatar: FC = () => (
  <div
    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
    style={{ background: 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)' }}
  >
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
      <rect x="2" y="4" width="12" height="9" rx="3"
        fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1" />
      <circle cx="5.5" cy="8.5" r="1.2" fill="white" />
      <circle cx="10.5" cy="8.5" r="1.2" fill="white" />
      <path d="M5.5 11 Q8 12.2 10.5 11" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

// ─── Message Bubble 
export const MessageBubble: FC<{ role: 'user' | 'bot'; text: string; expanded?: boolean; chatbotName: string }> = ({
  role, text, expanded, chatbotName,
}) => {
  const isBot = role === 'bot';
  const { userName, userAvatar } = useAuthStore();
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'S';

  if (expanded && isBot) {
    return (
      <div className="mb-5 max-w-[640px]">
        <p className="text-xs font-semibold text-gray-400 mb-1.5 ml-1">{chatbotName}</p>
        <div
          className="bot-bubble inline-block px-4 py-3 text-sm rounded-2xl rounded-tl-sm
                     bg-white border border-gray-200 shadow-sm text-gray-800"
          dangerouslySetInnerHTML={{ __html: formatBotText(text) }}
        />
      </div>
    );
  }

  if (expanded && !isBot) {
    return (
      <div className="mb-5 flex flex-col items-end max-w-[640px] ml-auto">
        <div
          className="px-4 py-3 text-sm rounded-2xl rounded-tr-sm text-white break-words"
          style={{ background: 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)' }}
        >
          {text}
        </div>
      </div>
    );
  }

  // Compact view — with avatars
  return (
    <div className={`flex ${isBot ? 'items-start' : 'items-end justify-end'} mb-4 gap-2`}>
      {isBot && <div className="mt-0.5 flex-shrink-0"><BotMiniAvatar /></div>}
      {isBot ? (
        <div
          className="bot-bubble min-w-0 flex-1 px-4 py-3 text-sm rounded-2xl rounded-tl-sm
                     bg-white border border-gray-100 shadow-sm text-gray-800"
          dangerouslySetInnerHTML={{ __html: formatBotText(text) }}
        />
      ) : (
        <div
          className="max-w-[75%] px-4 py-3 text-sm rounded-2xl rounded-tr-sm text-white break-words"
          style={{ background: 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)' }}
        >
          {text}
        </div>
      )}
      {!isBot && (
        userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)' }}
          >
            {userInitial}
          </div>
        )
      )}
    </div>
  );
};

// Typing Indicator
const TypingIndicator: FC<{ expanded?: boolean; chatbotName: string }> = ({ expanded, chatbotName }) => {
  if (expanded) {
    return (
      <div className="mb-5 max-w-[640px]">
        <p className="text-xs font-semibold text-gray-400 mb-1.5 ml-1">{chatbotName}</p>
        <div className="inline-flex bg-white border border-gray-200 rounded-2xl rounded-tl-sm
                        px-4 py-3 shadow-sm items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="mt-0.5 flex-shrink-0"><BotMiniAvatar /></div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

// ─── Main Widget ──────────────────────────────────────────────────────────────
const ChatbotWidget: FC = () => {
  const [isOpen,     setIsOpen    ] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  const { messages, input, setInput, loading, sendMessage, suggested, chatbotName } = useChatbot();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setIsExpanded(false);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const showSuggested = messages.length <= 1 && !loading;

  return (
    <>
      <style>{`
        @keyframes eyeWander {
          0%,30%   { transform: translateY(0px);    }
          40%,55%  { transform: translateY(-1.5px); }
          65%,80%  { transform: translateY(1.5px);  }
          90%,100% { transform: translateY(0px);    }
        }
        .bot-pupil { animation: eyeWander 4s ease-in-out infinite; }

        @keyframes pulseRing {
          0%  { box-shadow: 0 0 0 0    rgba(15,94,139,0.45); }
          70% { box-shadow: 0 0 0 14px rgba(15,94,139,0);    }
          100%{ box-shadow: 0 0 0 0    rgba(15,94,139,0);    }
        }
        .chatbot-trigger-pulse { animation: pulseRing 2.8s ease-out infinite; }

        @keyframes btnWiggle {
          0%,100% { transform: rotate(0deg);  }
          20%     { transform: rotate(-8deg); }
          40%     { transform: rotate(8deg);  }
          60%     { transform: rotate(-5deg); }
          80%     { transform: rotate(5deg);  }
        }
        .chatbot-trigger:hover { animation: btnWiggle 0.55s ease-in-out; }

        @keyframes drawerIn {
          from { opacity:0; transform: translateY(16px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .chatbot-drawer { animation: drawerIn 0.28s cubic-bezier(0.22,0.68,0,1.2); }

        @media (max-width: 640px) {
          @keyframes mobileUp {
            from { opacity:0; transform: translateY(100%); }
            to   { opacity:1; transform: translateY(0); }
          }
          .chatbot-drawer { animation: mobileUp 0.3s cubic-bezier(0.22,0.68,0,1.2); }
        }

        /* ── Bot bubble typography ── */
        .bot-bubble {
          word-break: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        .bot-bubble p {
          margin: 0 0 0.5em;
          line-height: 1.65;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .bot-bubble p:last-child { margin-bottom: 0; }
        .bot-bubble ol.bot-list,
        .bot-bubble ul.bot-list {
          margin: 0.35em 0 0.5em;
          padding: 0;
          list-style: none;
        }
        .bot-bubble .bot-list:last-child { margin-bottom: 0; }
        .bot-bubble .bot-list li {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding: 3px 0;
          line-height: 1.6;
        }
        .bot-bubble .list-num {
          flex-shrink: 0;
          min-width: 20px;
          font-weight: 700;
          color: #0f5e8b;
          font-size: 0.82em;
          padding-top: 1px;
        }
        .bot-bubble .list-text {
          flex: 1;
          min-width: 0;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .bot-bubble ul.bot-list li::before {
          content: '';
          flex-shrink: 0;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #0f5e8b;
          margin-top: 7px;
        }
        .bot-bubble strong { font-weight: 600; color: #0c2340; }
        .bot-bubble em     { font-style: italic; }
        .bot-bubble code {
          background: #f0f4f8;
          padding: 1px 5px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85em;
        }

        /* Scrollbar */
        .chat-scroll::-webkit-scrollbar       { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
          style={{ zIndex: 9997 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ─── COMPACT DRAWER ── */}
      {isOpen && !isExpanded && (
        <div
          className="chatbot-drawer fixed flex flex-col bg-white overflow-hidden shadow-2xl
                     inset-0
                     sm:inset-auto sm:bottom-6 sm:right-6
                     sm:w-[390px] sm:h-[580px]
                     sm:rounded-2xl sm:border sm:border-gray-200"
          style={{ zIndex: 9998 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20
                              flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                  <rect x="3" y="5" width="14" height="11" rx="4"
                    fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.1" />
                  <line x1="10" y1="5" x2="10" y2="2.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
                  <circle cx="10" cy="2" r="1" fill="white" />
                  <circle cx="7" cy="10.5" r="1.5" fill="white" />
                  <circle cx="13" cy="10.5" r="1.5" fill="white" />
                  <path d="M7 14 Q10 15.5 13 14" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-[15px] leading-tight">{chatbotName}</p>
                <p className="text-white/50 text-[11px] leading-tight mt-0.5">Your Academic Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(true)}
                className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center
                           text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                title="Expand"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center
                           text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-scroll flex-1 overflow-y-auto px-5 py-5 bg-gray-50/60"
               style={{ scrollbarWidth: 'thin' }}>
            {messages.map(m => <MessageBubble key={m.id} role={m.role} text={m.text} chatbotName={chatbotName} />)}
            {loading && <TypingIndicator chatbotName={chatbotName} />}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested */}
          {showSuggested && (
            <div className="px-5 py-3 bg-white border-t border-gray-100 flex-shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Suggested for you
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggested.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-gray-50
                               border border-gray-200 text-[#0f5e8b]
                               hover:bg-[#e8f3fa] hover:border-[#0f5e8b]/30 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-5 py-4 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl
                            px-3.5 py-2.5 transition-all duration-200
                            focus-within:bg-white focus-within:border-[#0f5e8b]/40
                            focus-within:ring-2 focus-within:ring-[#0f5e8b]/10">
              <input ref={inputRef} type="text" value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type your academic question..." disabled={loading}
                className="flex-1 text-sm text-gray-700 bg-transparent outline-none
                           placeholder:text-gray-400 disabled:opacity-50" />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                           transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{ background: input.trim() && !loading ? 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)' : '#e5e7eb' }}>
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Neo can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      )}

      {isOpen && isExpanded && (
        <div
          className="chatbot-drawer fixed inset-0 flex flex-col bg-white overflow-hidden"
          style={{ zIndex: 9998 }}
        >
          <div
            className="flex-shrink-0 pt-10 pb-7 px-6 text-center relative"
            style={{ background: 'linear-gradient(160deg, #0c2340 0%, #0f5e8b 60%, #1a7bb8 100%)' }}
          >
            {/* Collapse + Close buttons top-right */}
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                           text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                title="Collapse"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                           text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BotLargeAvatar />
            <p className="text-white font-bold text-xl mt-4 leading-tight">{chatbotName}</p>
            <p className="text-white/55 text-sm mt-1">Your Academic Assistant</p>
          </div>

          {/* Messages — centred column */}
          <div
            className="chat-scroll flex-1 overflow-y-auto bg-gray-50/40 py-6 px-4"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="max-w-[700px] mx-auto">
              {messages.map(m => (
                <MessageBubble key={m.id} role={m.role} text={m.text} expanded chatbotName={chatbotName} />
              ))}
              {loading && <TypingIndicator expanded chatbotName={chatbotName} />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested chips — expanded */}
          {showSuggested && (
            <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
              <div className="max-w-[700px] mx-auto flex flex-wrap gap-2">
                {suggested.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="text-[13px] font-medium px-4 py-2 rounded-full bg-gray-50
                               border border-gray-200 text-[#0f5e8b]
                               hover:bg-[#e8f3fa] hover:border-[#0f5e8b]/30 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input — expanded */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-4">
            <div className="max-w-[700px] mx-auto">
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl
                              px-4 py-3 transition-all duration-200
                              focus-within:bg-white focus-within:border-[#0f5e8b]/40
                              focus-within:ring-2 focus-within:ring-[#0f5e8b]/10">
                <input ref={inputRef} type="text" value={input}
                  onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Ask a question..." disabled={loading}
                  className="flex-1 text-sm text-gray-700 bg-transparent outline-none
                             placeholder:text-gray-400 disabled:opacity-50" />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                             transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  style={{ background: input.trim() && !loading ? 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)' : '#e5e7eb' }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Neo can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-trigger chatbot-trigger-pulse fixed bottom-6 right-6 w-14 h-14 rounded-2xl
                     flex items-center justify-center shadow-xl active:scale-95 transition-transform duration-150"
          style={{ background: 'linear-gradient(135deg, #0c2340 0%, #0f5e8b 100%)', zIndex: 9999 }}
          aria-label="Open Neo"
        >
          <div className="w-9 h-9"><BotFaceIcon /></div>
        </button>
      )}
    </>
  );
};

export default ChatbotWidget;