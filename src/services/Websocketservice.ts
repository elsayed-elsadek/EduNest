
import { Client, type StompSubscription } from '@stomp/stompjs';
import { API_BASE_URL } from '../config/env';
import logger from '../utils/logger';

const WS_URL = API_BASE_URL
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');

/**
 * Native WebSocket endpoint for STOMP over WebSocket (Integration Handbook §9.1).
 *
 * The backend decommissioned the SockJS handshake interceptor (BLK-20), so
 * SockJS fallback transports can no longer authenticate — the only supported
 * transport is a native WebSocket at `/ws/websocket`, with `ws://` on HTTP
 * origins and `wss://` on HTTPS ones.
 */
export function buildWsUrl(baseUrl: string): string {
  const { protocol, host } = new URL(baseUrl);
  const scheme = protocol === 'https:' ? 'wss:' : 'ws:';
  return `${scheme}//${host}/ws/websocket`;
}

const WS_ENDPOINT = buildWsUrl(WS_URL);

type MessageCallback = (data: unknown) => void;

class WebSocketService {
  private client:           Client | null = null;
  private subscriptions:    Map<string, StompSubscription> = new Map();
  private listeners:        Map<string, Set<MessageCallback>> = new Map();
  private pendingCallbacks: (() => void)[] = [];
  private isConnected_:     boolean = false;
  private isConnecting_:    boolean = false;
  private errorListeners:   Set<MessageCallback> = new Set();

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
      // Native WebSocket only — SockJS fallback transports cannot authenticate
      // against the current backend (BLK-20).
      webSocketFactory: () => new WebSocket(WS_ENDPOINT),
      // STOMP CONNECT uses the documented raw access JWT. The backend tolerates
      // a Bearer prefix, but raw is the wire contract (WEBSOCKET.md §1.2).
      connectHeaders:   { Authorization: token },
      reconnectDelay:   5000,

      onConnect: () => {
        this.isConnected_  = true;
        this.isConnecting_ = false;
        // Mandatory FIRST subscription (Handbook §9.1): interceptor exceptions
        // during async channel processing are dropped rather than emitted as
        // STOMP ERROR frames — the server pushes them here instead.
        this._subscribe('/user/queue/errors', (data) => {
          const summary =
            typeof data === 'string' ? data : JSON.stringify(data);
          logger.error('WebSocket server error', summary);
          this.errorListeners.forEach((cb) => cb(data));
        });
        onConnected?.();
        // flush all queued callbacks
        const pending = [...this.pendingCallbacks];
        this.pendingCallbacks = [];
        pending.forEach(cb => cb());
      },

      onStompError: (f) => {
        this.isConnecting_ = false;
        this.isConnected_  = false;
        this.subscriptions.clear();
        // The broker message is sanitised: it must never echo a token.
        logger.error('WebSocket STOMP error', f.headers['message']);
      },

      onWebSocketError: (e) => {
        this.isConnecting_ = false;
        logger.error('WebSocket connection error', e);
      },

      onDisconnect: () => {
        this.isConnected_  = false;
        this.isConnecting_ = false;
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

  /**
   * Registers a handler for server-pushed errors on `/user/queue/errors`
   * (authorization failures, validation errors). Returns an unsubscribe
   * function. Handlers persist across reconnects until unsubscribed.
   */
  onError(cb: MessageCallback): () => void {
    this.errorListeners.add(cb);
    return () => {
      this.errorListeners.delete(cb);
    };
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
      logger.warn('Cannot send message — WebSocket not connected');
      return;
    }
    // EF-1: the room-chat SEND endpoint binds a `ChatMessageRequest` DTO —
    // the frame body MUST be a JSON object `{"content": "..."}`. A raw string
    // body fails to bind and is rejected server-side (error via
    // /user/queue/errors, message not stored).
    this.client.publish({
      destination: `/app/chat/${roomId}`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  }

  sendPrivateMessage(recipientEmail: string, content: string): void {
    if (!this.client?.connected) {
      logger.warn('Cannot send private message — WebSocket not connected');
      return;
    }
    this.client.publish({
      destination: '/app/chat.private',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipientEmail, content }),
    });
  }

  get isConnected(): boolean { return this.isConnected_; }
}

export const wsService = new WebSocketService();
