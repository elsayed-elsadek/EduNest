import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { wsService } from '../services/Websocketservice';

const WebSocketContext = createContext<null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || !token) return;
    if (connectedRef.current) return; 

    connectedRef.current = true;
    wsService.connect(token);

    return () => {
      connectedRef.current = false;
      wsService.disconnect();
    };
  }, [token, isHydrated]);

  return (
    <WebSocketContext.Provider value={null}>
      {children}
    </WebSocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocketContext = () => useContext(WebSocketContext);