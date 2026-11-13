import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTimeout, RequestTimeoutError, REQUEST_TIMEOUT_MS } from '../fetchWithTimeout';

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('resolves with the response when the server answers in time', async () => {
    const fakeResponse = new Response('{}', { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse);
    vi.stubGlobal('fetch', fetchMock);

    const response = await fetchWithTimeout('https://api.example.com/file');

    expect(response).toBe(fakeResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/file',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('passes through the caller init (method, headers, credentials)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);

    await fetchWithTimeout('https://api.example.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/chat',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }),
    );
  });

  it('rejects with RequestTimeoutError when the deadline elapses', async () => {
    vi.useFakeTimers();

    // A fetch that hangs until the signal fires — simulates a dead connection.
    const hangingFetch = vi.fn(
      (_url: unknown, init?: { signal?: AbortSignal }) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );
    vi.stubGlobal('fetch', hangingFetch);

    const pending = fetchWithTimeout('https://api.example.com/slow');

    const assertion = expect(pending).rejects.toMatchObject({
      name: 'RequestTimeoutError',
      timeoutMs: REQUEST_TIMEOUT_MS,
    });

    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 1);
    await assertion;

    await expect(pending).rejects.toBeInstanceOf(RequestTimeoutError);
  });

  it('honours the caller-provided abort signal and preserves its reason', async () => {
    const externalController = new AbortController();
    const hangingFetch = vi.fn(
      (_url: unknown, init?: { signal?: AbortSignal }) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );
    vi.stubGlobal('fetch', hangingFetch);

    const pending = fetchWithTimeout(
      'https://api.example.com/stream',
      { signal: externalController.signal },
      REQUEST_TIMEOUT_MS,
    );

    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' });

    externalController.abort();
    await assertion;
  });

  it('rejects immediately when the caller signal was already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchWithTimeout('https://api.example.com/file', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
