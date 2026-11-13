import { afterEach, describe, expect, it } from 'vitest';
import { classifyRequestError } from '../classifyRequestError';
import { RequestTimeoutError } from '../fetchWithTimeout';

const originalOnLine = typeof navigator !== 'undefined' ? navigator.onLine : true;

function setOnLine(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value,
  });
}

afterEach(() => {
  setOnLine(originalOnLine);
});

describe('classifyRequestError', () => {
  it('reports offline whenever the browser has no connection, regardless of the thrown error', () => {
    setOnLine(false);

    expect(classifyRequestError(new Error('whatever'))).toBe('offline');
    expect(classifyRequestError(new RequestTimeoutError(15000))).toBe('offline');
  });

  it('classifies typed timeout errors', () => {
    setOnLine(true);

    expect(classifyRequestError(new RequestTimeoutError(15000))).toBe('timeout');
    expect(classifyRequestError(new DOMException('timed out', 'TimeoutError'))).toBe('timeout');
  });

  it('classifies axios-style aborted requests', () => {
    setOnLine(true);

    const axiosAbort = Object.assign(new Error('timeout of 15000ms exceeded'), {
      code: 'ECONNABORTED',
    });

    expect(classifyRequestError(axiosAbort)).toBe('timeout');
  });

  it('classifies server errors by their response status', () => {
    setOnLine(true);

    const serverError = Object.assign(new Error('Request failed with status 500'), {
      response: { status: 500 },
    });

    expect(classifyRequestError(serverError)).toBe('server');
  });

  it('falls back to unknown for everything else', () => {
    setOnLine(true);

    expect(classifyRequestError(new Error('Network Error'))).toBe('unknown');
    expect(classifyRequestError(undefined)).toBe('unknown');
    expect(classifyRequestError('weird')).toBe('unknown');
  });
});
