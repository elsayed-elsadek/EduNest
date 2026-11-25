import { beforeEach, describe, expect, it, vi } from 'vitest';

interface PublishFrame {
  destination: string;
  headers?: Record<string, string>;
  body: string;
}

interface FakeClientShape {
  options: {
    onConnect?: (frame: unknown) => void;
    webSocketFactory?: () => WebSocket;
    connectHeaders?: Record<string, string>;
    reconnectDelay?: number;
  };
  destinations: string[];
  subscribers: Array<{ destination: string; cb: (msg: { body: string }) => void }>;
  frames: PublishFrame[];
  activate(): void;
  readonly connected: boolean;
  subscribe(
    destination: string,
    cb: (msg: { body: string }) => void
  ): { unsubscribe: () => void };
  publish(frame: PublishFrame): void;
  deactivate(): void;
}

/**
 * Fake STOMP Client that records construction options, subscription order,
 * and published frames — enough to assert the wire contract without a real
 * broker. Defined inside vi.hoisted so the hoisted vi.mock factory can see it.
 */
const { FakeClient, clientInstances } = vi.hoisted((): {
  FakeClient: new (options: FakeClientShape['options']) => FakeClientShape;
  clientInstances: FakeClientShape[];
} => {
  const clientInstances: FakeClientShape[] = [];
  class FakeClientImpl implements FakeClientShape {
    options: FakeClientShape['options'];
    destinations: string[] = [];
    subscribers: FakeClientShape['subscribers'] = [];
    frames: FakeClientShape['frames'] = [];

    constructor(options: FakeClientShape['options']) {
      this.options = options;
      clientInstances.push(this);
    }

    activate(): void {
      this.options.onConnect?.({});
    }

    get connected(): boolean {
      return true;
    }

    subscribe(destination: string, cb: (msg: { body: string }) => void) {
      this.destinations.push(destination);
      this.subscribers.push({ destination, cb });
      return { unsubscribe: () => {} };
    }

    publish(frame: PublishFrame): void {
      this.frames.push(frame);
    }

    deactivate(): void {}
  }
  return { FakeClient: FakeClientImpl, clientInstances };
});

vi.mock('@stomp/stompjs', () => ({ Client: FakeClient }));

// Pin the API origin so the WS endpoint asserted below is deterministic.
// CI sets VITE_API_BASE_URL to the deployed URL (wss://...), while local
// .env uses localhost — without this pin the factory test would be
// environment-dependent (it failed exactly that way on CI). Everything
// else from the real config module stays intact.
vi.mock('../../config/env', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, API_BASE_URL: 'http://localhost:8080' };
});

import { buildWsUrl, wsService } from '../Websocketservice';

describe('buildWsUrl — native WebSocket endpoint construction', () => {
  it('uses ws:// for http origins (the backend-confirmed local endpoint)', () => {
    expect(buildWsUrl('http://localhost:8080')).toBe('ws://localhost:8080/ws/websocket');
  });

  it('uses wss:// for https origins', () => {
    expect(buildWsUrl('https://backend.edunest.dpdns.org')).toBe(
      'wss://backend.edunest.dpdns.org/ws/websocket'
    );
  });

  it('strips a trailing /api/v1 path from the base URL', () => {
    expect(buildWsUrl('http://api.example.com/api/v1')).toBe(
      'ws://api.example.com/ws/websocket'
    );
  });

  it('never uses the SockJS transport path', () => {
    const url = buildWsUrl('https://backend.edunest.dpdns.org');
    expect(url.endsWith('/ws/websocket')).toBe(true);
    expect(url).not.toContain('/ws?');
    expect(url).not.toMatch(/\/ws\/$/);
  });
});

describe('wsService — STOMP over native WebSocket', () => {
  beforeEach(() => {
    clientInstances.length = 0;
    wsService.disconnect();
  });

  function lastClient(): FakeClientShape {
    const client = clientInstances.at(-1);
    expect(client).toBeDefined();
    return client as FakeClientShape;
  }

  it('connects with the documented raw JWT in the STOMP Authorization header', () => {
    wsService.connect('raw.jwt.token');

    const client = lastClient();
    expect(client.options.connectHeaders).toEqual({ Authorization: 'raw.jwt.token' });
    expect(client.options.connectHeaders?.Authorization).not.toContain('Bearer');
  });

  it('creates a native WebSocket at /ws/websocket (not SockJS)', () => {
    const createdUrls: string[] = [];
    class FakeWebSocket {
      constructor(url: string) {
        createdUrls.push(url);
      }
    }
    vi.stubGlobal('WebSocket', FakeWebSocket);

    try {
      wsService.connect('raw.jwt.token');
      const client = lastClient();
      const factory = client.options.webSocketFactory as () => WebSocket;
      factory();

      expect(createdUrls).toEqual(['ws://localhost:8080/ws/websocket']);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('registers /user/queue/errors as the FIRST subscription, before consumer callbacks', () => {
    wsService.connect('raw.jwt.token', () => {
      // consumer subscribes inside the onConnected callback — must come second
      wsService.subscribeToRoom('7', () => {});
    });

    const client = lastClient();
    expect(client.destinations[0]).toBe('/user/queue/errors');
    expect(client.destinations[1]).toBe('/topic/room/7');
  });

  it('keeps existing subscription destinations unchanged', () => {
    wsService.connect('raw.jwt.token');

    const client = lastClient();
    expect(client.destinations).toEqual(['/user/queue/errors']);

    wsService.subscribeToNotifications(() => {});
    wsService.subscribeToPrivateMessages(() => {});
    wsService.subscribeToRoom(42, () => {});

    expect(client.destinations).toEqual([
      '/user/queue/errors',
      '/user/queue/notifications',
      '/user/queue/messages',
      '/topic/room/42',
    ]);
  });

  it('publishes JSON SEND frames with content-type headers and unchanged destinations/bodies', () => {
    wsService.connect('raw.jwt.token');

    const client = lastClient();

    wsService.sendToRoom('abc', 'hello room');
    expect(client.frames[0]).toEqual({
      destination: '/app/chat/abc',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: 'hello room' }),
    });

    wsService.sendPrivateMessage('mentor@test.com', 'hi there');
    expect(client.frames[1]).toEqual({
      destination: '/app/chat.private',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipientEmail: 'mentor@test.com', content: 'hi there' }),
    });
  });

  it('keeps the private destination and existing payload until a post-EB-20 contract is verified', () => {
    wsService.connect('raw.jwt.token');

    const client = lastClient();
    wsService.sendPrivateMessage('mentor@test.com', 'hi there');

    expect(client.frames[0].destination).toBe('/app/chat.private');
    expect(JSON.parse(client.frames[0].body)).toEqual({
      recipientEmail: 'mentor@test.com',
      content: 'hi there',
    });
  });

  it('never sends a room message as a raw string body (EF-1 — DTO binding)', () => {
    wsService.connect('raw.jwt.token');

    const client = lastClient();
    wsService.sendToRoom('abc', 'hello room');

    const frame = client.frames[0];
    expect(frame.destination).toBe('/app/chat/abc');
    // A raw string body fails ChatMessageRequest binding server-side: the
    // message is NOT stored and an error lands on /user/queue/errors. The
    // body must therefore always parse to an object carrying `content`.
    expect(frame.body).not.toBe('hello room');
    expect(JSON.parse(frame.body)).toEqual({ content: 'hello room' });
  });

  it('fans out /user/queue/errors payloads to registered onError handlers', () => {
    wsService.connect('raw.jwt.token');
    const client = lastClient();

    const received: unknown[] = [];
    const off = wsService.onError((data) => received.push(data));

    const errorSub = client.subscribers.find(
      (s: FakeClientShape['subscribers'][number]) => s.destination === '/user/queue/errors'
    );
    expect(errorSub).toBeDefined();
    errorSub?.cb({ body: '"Forbidden: you are not a member of this room"' });

    expect(received).toEqual(['Forbidden: you are not a member of this room']);

    off();
    errorSub?.cb({ body: '"another error"' });
    expect(received).toEqual(['Forbidden: you are not a member of this room']);
  });

  it('does not re-subscribe /user/queue/errors on duplicate registrations', () => {
    wsService.connect('raw.jwt.token');
    wsService.onError(() => {});
    wsService.onError(() => {});

    const client = lastClient();
    expect(client.destinations.filter((d: string) => d === '/user/queue/errors')).toHaveLength(1);
  });
});
