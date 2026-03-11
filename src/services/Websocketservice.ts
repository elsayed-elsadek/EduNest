
import SockJS from 'sockjs-client';
import { Client, type StompSubscription } from '@stomp/stompjs';

const WS_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');

type MessageCallback = (data: unknown) => void;

class WebSocketService {
  private client:           Client | null = null;
  private subscriptions:    Map<string, StompSubscription> = new Map();
  private pendingCallbacks: (() => void)[] = [];
  private isConnected_:     boolean = false;
  private isConnecting_:    boolean = false;   // ← NEW: guard against double-connect

  connect(token: string, onConnected?: () => void): void {
    // Already fully connected — run callback immediately
    if (this.isConnected_) {
      onConnected?.();
      return;
    }

    // just queue the callback — don't create a second client
    if (this.isConnecting_) {
      if (onConnected) this.pendingCallbacks.push(onConnected);
      return;
    }

    this.isConnecting_ = true;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      connectHeaders:   { Authorization: token },
      reconnectDelay:   5000,

      onConnect: () => {
        this.isConnected_  = true;
        this.isConnecting_ = false;
        console.log('✅ WebSocket connected');
        onConnected?.();
        this.pendingCallbacks.forEach(cb => cb());
        this.pendingCallbacks = [];
      },

      onStompError: (f) => {
        this.isConnecting_ = false;
        console.error('❌ STOMP error:', f.headers['message']);
      },
      onWebSocketError: (e) => {
        this.isConnecting_ = false;
        console.error('❌ WS error:', e);
      },
      onDisconnect: () => {
        this.isConnected_  = false;
        this.isConnecting_ = false;
        console.log('🔌 WS disconnected');
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.isConnected_  = false;
    this.isConnecting_ = false;
  }

  private _subscribe(destination: string, cb: MessageCallback): void {
    if (!this.client) return;

    const doSub = () => {
      if (this.subscriptions.has(destination)) return;
      // Guard: only subscribe if STOMP is actually connected
      if (!this.client?.connected) return;
      const sub = this.client.subscribe(destination, (msg) => {
        try   { cb(JSON.parse(msg.body)); }
        catch { cb(msg.body); }
      });
      this.subscriptions.set(destination, sub);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.isConnected_ ? doSub() : this.pendingCallbacks.push(doSub);
  }

  unsubscribe(destination: string): void {
    this.subscriptions.get(destination)?.unsubscribe();
    this.subscriptions.delete(destination);
  }

  subscribeToNotifications(cb: MessageCallback): void {
    this._subscribe('/user/queue/notifications', cb);
  }

  subscribeToPrivateMessages(cb: MessageCallback): void {
    this._subscribe('/user/queue/messages', cb);
  }

  subscribeToRoom(roomId: number | string, cb: MessageCallback): void {
    this._subscribe(`/topic/room/${roomId}`, cb);
  }

  unsubscribeFromRoom(roomId: number | string): void {
    this.unsubscribe(`/topic/room/${roomId}`);
  }

  sendToRoom(roomId: number | string, content: string): void {
    this.client?.publish({ destination: `/app/chat/${roomId}`, body: content });
  }

  sendPrivateMessage(recipientEmail: string, content: string): void {
    this.client?.publish({
      destination: '/app/chat.private',
      body: JSON.stringify({ recipientEmail, content }),
    });
  }

  get isConnected(): boolean { return this.isConnected_; }
}

export const wsService = new WebSocketService();