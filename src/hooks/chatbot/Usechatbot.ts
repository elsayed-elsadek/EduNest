
import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatApiResponse } from '../../types/chatbot/Chatbot.types';
import { CHATBOT_API_URL } from '../../config/env';
import { fetchWithTimeout } from '../../utils/fetchWithTimeout';

const CHATBOT_NAME = 'Neo';

const SUGGESTED = [
  'Summarize my courses',
  'Help with assignment',
  'Find research papers',
  'Check my schedule',
];

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id:        'welcome',
      role:      'bot',
      text:      'أهلاً! أنا Neo، مساعدك الأكاديمي. كيف أقدر أساعدك اليوم؟ 😊',
      timestamp: new Date(),
    },
  ]);
  const [input,   setInput  ] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = {
      id:        `u-${Date.now()}`,
      role:      'user',
      text:      msg,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      if (!CHATBOT_API_URL) {
        throw new Error('chatbot-not-configured');
      }

      const res = await fetchWithTimeout(CHATBOT_API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg }),
        signal:  abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: ChatApiResponse = await res.json();

      const botMsg: ChatMessage = {
        id:        `b-${Date.now()}`,
        role:      'bot',
        text:      data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const errMsg: ChatMessage = {
        id:        `e-${Date.now()}`,
        role:      'bot',
        text:      'عذراً، حصل خطأ. حاول تاني! 🙁',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return { messages, input, setInput, loading, sendMessage, suggested: SUGGESTED, chatbotName: CHATBOT_NAME };
};