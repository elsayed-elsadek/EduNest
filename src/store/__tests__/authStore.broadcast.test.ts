import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class TestBroadcastChannel {
  static instances: TestBroadcastChannel[] = [];
  readonly name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();

  constructor(name: string) {
    this.name = name;
    TestBroadcastChannel.instances.push(this);
  }
}

describe('authStore logout broadcast', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    TestBroadcastChannel.instances = [];
    vi.stubGlobal('BroadcastChannel', TestBroadcastChannel);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('broadcasts logout without sending either token to peer tabs', async () => {
    vi.resetModules();
    const { useAuthStore } = await import('../authStore');
    useAuthStore.getState().setAuth({
      token: 'synthetic-access-token',
      refreshToken: 'synthetic-refresh-token',
      rememberMe: true,
    });

    useAuthStore.getState().logout();
    await Promise.resolve();

    expect(TestBroadcastChannel.instances).toHaveLength(1);
    expect(TestBroadcastChannel.instances[0].name).toBe('edunest_auth_sync');
    expect(TestBroadcastChannel.instances[0].postMessage).toHaveBeenCalledWith({ type: 'LOGOUT' });
    expect(JSON.stringify(TestBroadcastChannel.instances[0].postMessage.mock.calls))
      .not.toContain('synthetic-access-token');
    expect(JSON.stringify(TestBroadcastChannel.instances[0].postMessage.mock.calls))
      .not.toContain('synthetic-refresh-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
    expect(window.sessionStorage.getItem('auth-storage')).toBeNull();
  });
});
