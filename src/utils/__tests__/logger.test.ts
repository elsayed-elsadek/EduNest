import { describe, expect, it, vi } from 'vitest';
import logger, { sanitizeForLog, sanitizeString } from '../logger';

const JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';

describe('sanitizeString', () => {
  it('redacts bearer tokens', () => {
    const result = sanitizeString('Authorization: Bearer abc.def.ghi');

    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('abc.def.ghi');
  });

  it('redacts raw JWTs', () => {
    const result = sanitizeString(`token received: ${JWT}`);

    expect(result).not.toContain(JWT);
    expect(result).toContain('[REDACTED]');
  });

  it.each(['password', 'token', 'api_key', 'secret', 'access_token'])(
    'redacts the value assigned to "%s"',
    (key) => {
      const result = sanitizeString(`${key}=super-secret-value`);

      expect(result).not.toContain('super-secret-value');
      expect(result).toContain('[REDACTED]');
    },
  );

  it('redacts e-mail addresses', () => {
    const result = sanitizeString('login failed for sara@example.com');

    expect(result).not.toContain('sara@example.com');
    expect(result).toContain('[REDACTED]');
  });

  it('strips the query string from URLs', () => {
    const result = sanitizeString('GET https://api.example.com/users?email=a@b.com&token=xyz');

    expect(result).toContain('https://api.example.com/users');
    expect(result).not.toContain('xyz');
    expect(result).not.toContain('a@b.com');
    expect(result).not.toContain('?');
  });

  it('falls back to splitting when the URL cannot be parsed', () => {
    const result = sanitizeString('see https://[broken?token=abc');

    expect(result).not.toContain('token=abc');
  });

  it('leaves ordinary text untouched', () => {
    expect(sanitizeString('mentorship loaded successfully')).toBe(
      'mentorship loaded successfully',
    );
  });
});

describe('sanitizeForLog', () => {
  it('passes primitives through', () => {
    expect(sanitizeForLog(null)).toBeNull();
    expect(sanitizeForLog(undefined)).toBeUndefined();
    expect(sanitizeForLog(42)).toBe(42);
    expect(sanitizeForLog(true)).toBe(true);
    expect(sanitizeForLog(BigInt(7))).toBe(BigInt(7));
  });

  it('describes functions and symbols instead of printing them', () => {
    expect(sanitizeForLog(() => undefined)).toBe('[Function]');
    expect(sanitizeForLog(Symbol('session'))).toBe('Symbol(session)');
  });

  it('serialises dates as ISO strings', () => {
    expect(sanitizeForLog(new Date('2026-01-02T03:04:05.000Z'))).toBe(
      '2026-01-02T03:04:05.000Z',
    );
  });

  it('never prints a DOM node by reference', () => {
    expect(sanitizeForLog(document.createElement('div'))).toBe('[DOM node]');
  });

  it('redacts sensitive object keys recursively', () => {
    const result = sanitizeForLog({
      authorization: 'Bearer abc.def.ghi',
      password: 'hunter2',
      email: 'sara@example.com',
      nested: { apiKey: 'key-123', safe: 'visible' },
    });

    expect(result).toEqual({
      authorization: '[REDACTED]',
      password: '[REDACTED]',
      email: '[REDACTED]',
      nested: { apiKey: '[REDACTED]', safe: 'visible' },
    });
  });

  it('redacts secrets inside arrays', () => {
    expect(sanitizeForLog([{ token: 'abc' }, 'plain'])).toEqual([
      { token: '[REDACTED]' },
      'plain',
    ]);
  });

  it('converts errors into plain, sanitised objects', () => {
    const error = new Error('login failed for sara@example.com');
    (error as Error & { token?: string }).token = 'abc';

    const result = sanitizeForLog(error) as Record<string, unknown>;

    expect(result.name).toBe('Error');
    expect(result.message).toBe('login failed for [REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(typeof result.stack).toBe('string');
  });

  it('flags circular references instead of recursing forever', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(sanitizeForLog(circular)).toEqual({ self: '[Circular]' });
  });

  it('caps recursion depth for objects', () => {
    const root: Record<string, unknown> = {};
    let cursor = root;
    for (let i = 0; i < 10; i += 1) {
      const child: Record<string, unknown> = {};
      cursor.child = child;
      cursor = child;
    }

    expect(JSON.stringify(sanitizeForLog(root))).toContain('[Max depth]');
  });

  it('caps recursion depth for arrays', () => {
    const nested = [[[[[[[[['deep']]]]]]]]];

    expect(JSON.stringify(sanitizeForLog(nested))).toContain('[Max depth]');
  });
});

describe('logger', () => {
  it.each([
    ['debug', 'debug'],
    ['info', 'info'],
    ['log', 'log'],
    ['warn', 'warn'],
    ['error', 'error'],
  ] as const)('forwards %s to console.%s in development', (method, consoleMethod) => {
    const spy = vi.spyOn(console, consoleMethod).mockImplementation(() => undefined);

    logger[method]('hello');

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('sanitises every argument before printing it', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    logger.warn('login failed', { password: 'hunter2' }, 'token=abc');

    expect(spy).toHaveBeenCalledWith('login failed', { password: '[REDACTED]' }, 'token=[REDACTED]');
  });

  it('passes multiple arguments through in order', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logger.info('a', 1, true);

    expect(spy).toHaveBeenCalledWith('a', 1, true);
  });
});
