import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock factories are hoisted above imports, so the fake api must be created
// in vi.hoisted (same pattern as the existing service tests).
const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../api', () => ({ default: apiMock }));

import { deleteMessage, editMessage, getConversationMessages } from '../Directchatservice';

const MESSAGE_ID = '9d314e6b-8f22-1c5a-7e9d-3b1e44c2a0b7';
const CONVERSATION_ID = 'c1a2b3c4-d5e6-4f70-8192-a3b4c5d6e7f8';
const BEFORE_ID = '6f1c2a8e-3b7d-4c1e-9a55-2d8f0c7b1e44';

beforeEach(() => {
  apiMock.get.mockResolvedValue({ data: { apiResponse: { messages: [] } } });
  apiMock.patch.mockResolvedValue({ data: {} });
  apiMock.delete.mockResolvedValue({ data: {} });
});

describe('INT-04 Batch 1 — direct-chat REST payloads', () => {
  it('PATCH preserves the UUID string and sends only { content }', async () => {
    await editMessage(MESSAGE_ID, 'edited text');

    expect(apiMock.patch).toHaveBeenCalledTimes(1);
    const [url, body] = apiMock.patch.mock.calls[0] as [string, unknown];

    expect(url).toBe(`api/v1/conversation/messages/${MESSAGE_ID}`);
    expect(url).not.toMatch(/NaN|undefined/);
    expect(body).toEqual({ content: 'edited text' });
    expect(Object.keys(body as Record<string, unknown>)).toEqual(['content']);
    expect(JSON.stringify(body)).not.toMatch(/recipientEmail|recipientId/);
  });

  it('DELETE preserves the UUID string and has no request data/body', async () => {
    await deleteMessage(MESSAGE_ID);

    expect(apiMock.delete).toHaveBeenCalledTimes(1);
    const args = apiMock.delete.mock.calls[0] as unknown[];

    expect(args).toHaveLength(1);
    expect(args[0]).toBe(`api/v1/conversation/messages/${MESSAGE_ID}`);
    expect(args[0]).not.toMatch(/NaN|undefined/);
    expect(args[1]).toBeUndefined();
    expect(JSON.stringify(args)).not.toMatch(/recipientEmail|recipientId/);
  });

  it('GET history keeps conversationId and beforeId as UUID strings', async () => {
    await getConversationMessages(CONVERSATION_ID, 20, BEFORE_ID);

    expect(apiMock.get).toHaveBeenCalledWith(
      `api/v1/conversation/${CONVERSATION_ID}/messages`,
      { params: { size: 20, beforeId: BEFORE_ID } },
    );

    const [url] = apiMock.get.mock.calls[0] as [string];
    expect(typeof url).toBe('string');
    expect(url).not.toMatch(/NaN|undefined/);
  });
});

describe('INT-04 Batch 1 — Axios error preservation', () => {
  const normalized = {
    errorCode: 'ERR_FORBIDDEN',
    known: true,
    message: 'This chat is unavailable.',
    status: 403,
    fields: {},
  };

  const axiosError = Object.assign(new Error('Request failed with status code 403'), {
    response: { status: 403, data: { errorCode: 'ERR_FORBIDDEN', message: normalized.message } },
    normalized,
    config: {},
  });

  it('PATCH rejects with the original error, status, and normalized metadata', async () => {
    apiMock.patch.mockRejectedValueOnce(axiosError);
    expect.assertions(4);

    try {
      await editMessage(MESSAGE_ID, 'edited text');
    } catch (error) {
      const caught = error as typeof axiosError;
      expect(caught).toBe(axiosError);
      expect(caught.response.status).toBe(403);
      expect(caught.normalized).toEqual(normalized);
      expect(caught.normalized.status).toBe(403);
    }
  });

  it('DELETE rejects with the original error, status, and normalized metadata', async () => {
    apiMock.delete.mockRejectedValueOnce(axiosError);
    expect.assertions(4);

    try {
      await deleteMessage(MESSAGE_ID);
    } catch (error) {
      const caught = error as typeof axiosError;
      expect(caught).toBe(axiosError);
      expect(caught.response.status).toBe(403);
      expect(caught.normalized).toEqual(normalized);
      expect(caught.normalized.status).toBe(403);
    }
  });
});
