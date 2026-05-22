
import SockJS from 'sockjs-client';
import { Client, type StompSubscription } from '@stomp/stompjs';

const WS_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');

type MessageCallback = (data: unknown) => void;

class WebSocketService {
  private client:           Client | null = null;
  private subscriptions:    Map<string, StompSubscription> = new Map();
  private listeners:        Map<string, Set<MessageCallback>> = new Map();
  private pendingCallbacks: (() => void)[] = [];
  private isConnected_:     boolean = false;
  private isConnecting_:    boolean = false;

  connect(token: string, onConnected?: () => void): void {
    // Already fully connected — run callback immediately
    if (this.isConnected_) {
      onConnected?.();
      return;
    }

    // Already connecting — just queue the callback, don't create a second client
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
        // flush all queued callbacks
        const pending = [...this.pendingCallbacks];
        this.pendingCallbacks = [];
        pending.forEach(cb => cb());
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
    this.listeners.clear();
    this.pendingCallbacks = []; // ✅ امسح أي callbacks معلقة
    this.client?.deactivate();
    this.client         = null;
    this.isConnected_   = false;
    this.isConnecting_  = false;
  }

  private _subscribe(destination: string, cb: MessageCallback): void {
    const registerListener = () => {
      const listeners = this.listeners.get(destination) ?? new Set<MessageCallback>();
      listeners.add(cb);
      this.listeners.set(destination, listeners);
    };

    registerListener();

    const doSub = () => {
      if (!this.client?.connected) return;
      if (this.subscriptions.has(destination)) return;

      const listeners = this.listeners.get(destination);
      if (!listeners || listeners.size === 0) return;

      const sub = this.client.subscribe(destination, (msg) => {
        const listenersSet = this.listeners.get(destination);
        if (!listenersSet || listenersSet.size === 0) return;

        let payload: unknown;
        try   { payload = JSON.parse(msg.body); }
        catch { payload = msg.body; }

        listenersSet.forEach(listener => listener(payload));
      });

      this.subscriptions.set(destination, sub);
    };

    if (this.isConnected_) {
      doSub();
    } else {
      this.pendingCallbacks.push(doSub);
    }
  }

  unsubscribe(destination: string, cb?: MessageCallback): void {
    const listeners = this.listeners.get(destination);
    if (!listeners) return;

    if (cb) {
      listeners.delete(cb);
      if (listeners.size > 0) return;
    }

    const sub = this.subscriptions.get(destination);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(destination);
    }
    this.listeners.delete(destination);
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
    if (!this.client?.connected) {
      console.warn('⚠️ Cannot send message — WebSocket not connected');
      return;
    }
    this.client.publish({ destination: `/app/chat/${roomId}`, body: content });
  }

  sendPrivateMessage(recipientEmail: string, content: string): void {
    if (!this.client?.connected) {
      console.warn('⚠️ Cannot send message — WebSocket not connected');
      return;
    }
    this.client.publish({
      destination: '/app/chat.private',
      body: JSON.stringify({ recipientEmail, content }),
    });
  }

  get isConnected(): boolean { return this.isConnected_; }
}

export const wsService = new WebSocketService();