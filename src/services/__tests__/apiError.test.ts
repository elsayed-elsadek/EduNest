/**
 * EF-2 — unified error contract parsing.
 *
 * Covers the reviewed matrix: the deployed EB-12 envelope, every legacy
 * dialect found in the codebase, malformed bodies, unknown codes (must pass
 * through unchanged), refId presence rules, and the presentation-only
 * `showApiError` helper.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock factories are hoisted above imports — the toast mock must live in
// vi.hoisted so the factory can reference it (same pattern as Websocketservice.test.ts).
const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock('react-hot-toast', () => ({ default: { error: toastMock } }));

import { ApiValidationError, parseApiError } from '../errors';
import { showApiError } from '../../utils/showApiError';

/** Fabricates an axios-like rejection without any real network. */
function axiosError(status: number | undefined, data: unknown, code = 'ERR_BAD_REQUEST', headers?: unknown) {
  return Object.assign(new Error('Request failed with status code'), {
    code,
    response: status === undefined ? undefined : { status, data, headers },
    config: {},
  });
}

beforeEach(() => {
  toastMock.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseApiError — unified envelope (EB-12, verified live)', () => {
  it.each([
    ['ERR_RATE_LIMITED', 60],
    ['ERR_ACCOUNT_LOCKED', 300],
  ])('uses the %s fallback when Retry-After is absent', (errorCode, fallback) => {
    const parsed = parseApiError(axiosError(429, {
      errorCode,
      error: 'Too Many Requests',
      message: 'Wait before retrying.',
    }));
    expect(parsed).toMatchObject({ errorCode, status: 429, retryAfterSeconds: fallback, error: 'Too Many Requests' });
  });

  it.each(['30', 0, '0'])('accepts valid Retry-After seconds: %s', (header) => {
    const parsed = parseApiError(axiosError(429, { errorCode: 'ERR_RATE_LIMITED', message: 'Wait.' }, 'ERR_BAD_REQUEST', { 'retry-after': header }));
    expect(parsed.retryAfterSeconds).toBe(Number(header));
  });

  it.each(['', '-1', '1.5', 'Wed, 21 Oct 2030 07:28:00 GMT', '3s', Number.NaN])(
    'uses code-specific fallback for invalid Retry-After: %s',
    (header) => {
      const parsed = parseApiError(axiosError(429, { errorCode: 'ERR_ACCOUNT_LOCKED', message: 'Wait.' }, 'ERR_BAD_REQUEST', { 'Retry-After': header }));
      expect(parsed.retryAfterSeconds).toBe(300);
    },
  );

  it('does not add retry metadata to non-429 errors', () => {
    const parsed = parseApiError(axiosError(403, { errorCode: 'ERR_ACCOUNT_LOCKED', message: 'Denied.' }, 'ERR_BAD_REQUEST', { 'Retry-After': '7' }));
    expect(parsed.retryAfterSeconds).toBeUndefined();
  });

  it('parses a full 403 ERR_FORBIDDEN envelope', () => {
    const parsed = parseApiError(
      axiosError(403, {
        timestamp: '2026-10-29T19:30:00',
        status: 403,
        error: 'Forbidden',
        errorCode: 'ERR_FORBIDDEN',
        message: 'You do not have permission to access this resource.',
        path: '/api/v1/contact/all-messages',
      })
    );

    expect(parsed).toMatchObject({
      errorCode: 'ERR_FORBIDDEN',
      known: true,
      message: 'You do not have permission to access this resource.',
      status: 403,
      fields: {},
    });
    expect(parsed.refId).toBeUndefined();
  });

  it('parses 401 ERR_UNAUTHENTICATED', () => {
    const parsed = parseApiError(
      axiosError(401, {
        status: 401,
        error: 'Unauthorized',
        errorCode: 'ERR_UNAUTHENTICATED',
        message: 'Authentication required. Please log in.',
        path: '/api/v1/mentorship/all',
      })
    );

    expect(parsed.errorCode).toBe('ERR_UNAUTHENTICATED');
    expect(parsed.message).toBe('Authentication required. Please log in.');
    expect(parsed.status).toBe(401);
  });

  it('maps the fields object on 400 ERR_VALIDATION (AC#4)', () => {
    const parsed = parseApiError(
      axiosError(400, {
        status: 400,
        error: 'Bad Request',
        errorCode: 'ERR_VALIDATION',
        message: 'Validation failed.',
        fields: { name: 'Name is required', email: 'Invalid email' },
      })
    );

    expect(parsed.errorCode).toBe('ERR_VALIDATION');
    expect(parsed.fields).toEqual({ name: 'Name is required', email: 'Invalid email' });
  });

  it.each([
    ['comma-separated string', 'email, firstName'],
    ['stringified array', JSON.stringify(['email', 'firstName'])],
  ])('preserves ERR_UNKNOWN_FIELD diagnostics when allowedFields is a %s', (_label, allowedFields) => {
    const parsed = parseApiError(axiosError(400, {
      errorCode: 'ERR_UNKNOWN_FIELD',
      message: 'Field is not allowed.',
      fields: { invalidField: 'unexpected', allowedFields },
    }));

    expect(parsed.errorCode).toBe('ERR_UNKNOWN_FIELD');
    expect(parsed.fields).toEqual({ invalidField: 'unexpected', allowedFields });
  });

  it('ERR_VALIDATION without a fields object → empty fields, message intact, no crash', () => {
    const parsed = parseApiError(
      axiosError(400, {
        status: 400,
        error: 'Bad Request',
        errorCode: 'ERR_VALIDATION',
        message: 'Validation failed.',
      })
    );

    expect(parsed.errorCode).toBe('ERR_VALIDATION');
    expect(parsed.fields).toEqual({});
    expect(parsed.message).toBe('Validation failed.');
  });

  it('UNKNOWN errorCode values pass through UNCHANGED (future-proof branching)', () => {
    const parsed = parseApiError(
      axiosError(418, { errorCode: 'ERR_TOTALLY_NEW', message: 'New backend rule', status: 418 })
    );

    expect(parsed.errorCode).toBe('ERR_TOTALLY_NEW');
    expect(parsed.known).toBe(false);
    expect(parsed.message).toBe('New backend rule');
  });

  it('keeps refId on 500 and drops it elsewhere (AC#5)', () => {
    const withRef = parseApiError(
      axiosError(500, { errorCode: 'ERR_INTERNAL_SYSTEM', message: 'Something went wrong.', refId: 'a1b2c3d4' })
    );
    const withoutRef = parseApiError(
      axiosError(500, { errorCode: 'ERR_INTERNAL_SYSTEM', message: 'Something went wrong.' })
    );
    const on401 = parseApiError(
      axiosError(401, { errorCode: 'ERR_UNAUTHENTICATED', message: 'Please log in.', refId: 'should-not-stick' })
    );

    expect(withRef.refId).toBe('a1b2c3d4');
    expect(withoutRef.refId).toBeUndefined();
    expect(on401.refId).toBeUndefined();
  });

  it('a non-string or empty message falls back to a clean status text', () => {
    const parsed = parseApiError(axiosError(409, { errorCode: 'ERR_EMAIL_IN_USE', message: 42 }));
    expect(parsed.message).toBe('This conflicts with existing data.');
  });
});

describe('parseApiError — malformed and hostile bodies (never throws)', () => {
  it.each([
    ['HTML page from a proxy', '<html><body>502 Bad Gateway</body></html>'],
    ['empty object', {}],
    ['null body', null],
    ['numeric body', 42],
    ['array body', ['unexpected']],
  ])('falls back safely on %s', (_label, data) => {
    const parsed = parseApiError(axiosError(502, data));
    expect(parsed.errorCode).toBe('ERR_UNKNOWN');
    expect(parsed.message).not.toContain('Request failed with status code'); // axios text never leaks
    expect(parsed.message.length).toBeGreaterThan(0);
  });

  it('a network drop (no response) becomes ERR_NETWORK with a friendly message', () => {
    const parsed = parseApiError(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' }));
    expect(parsed.errorCode).toBe('ERR_NETWORK');
    expect(parsed.status).toBe(0);
    expect(parsed.message).toBe('Network error. Please check your connection and try again.');
  });

  it('the local SESSION_EXPIRED rejection normalizes to a friendly message', () => {
    const parsed = parseApiError(Object.assign(new Error('Session expired'), { code: 'SESSION_EXPIRED' }));
    expect(parsed.errorCode).toBe('SESSION_EXPIRED');
    expect(parsed.message).toBe('Your session has expired. Please log in again.');
  });

  it('a thrown STRING is treated as the display message (service contract)', () => {
    expect(parseApiError('Email already in use').message).toBe('Email already in use');
  });

  it('parsing never throws — even on hostile error objects', () => {
    const hostile = { get response(): unknown { throw new Error('boom'); } };
    const parsed = parseApiError(hostile);
    expect(parsed.errorCode).toBe('ERR_UNKNOWN');
  });
});

describe('parseApiError — legacy dialects (pre-EB-12 bodies)', () => {
  it('legacy `{ errorMessages }` validation body → fields map + first message', () => {
    const parsed = parseApiError(
      axiosError(400, { errorMessages: { name: 'Name is required', email: 'Invalid email' } })
    );

    expect(parsed.errorCode).toBe('ERR_VALIDATION');
    expect(parsed.fields).toEqual({ name: 'Name is required', email: 'Invalid email' });
    expect(parsed.message).toBe('Name is required');
  });

  it('legacy `{ apiResponse: { message } }` wrapper', () => {
    const parsed = parseApiError(axiosError(400, { apiResponse: { message: 'Old-style failure' } }));
    expect(parsed.message).toBe('Old-style failure');
  });

  it('legacy bare `{ message }` body', () => {
    const parsed = parseApiError(axiosError(400, { message: 'Bare message' }));
    expect(parsed.message).toBe('Bare message');
  });

  it('Spring default `{ error }` body without errorCode', () => {
    const parsed = parseApiError(axiosError(403, { timestamp: '...', status: 403, error: 'Forbidden', path: '/' }));
    expect(parsed.message).toBe('Forbidden');
  });
});

describe('parseApiError — service-thrown raw bodies (`throw response?.data ?? message`)', () => {
  it('a thrown raw ENVELOPE object parses with its own status', () => {
    const parsed = parseApiError({
      timestamp: '2026-10-29T19:30:00',
      status: 403,
      error: 'Forbidden',
      errorCode: 'ERR_FORBIDDEN',
      message: 'You do not have permission to access this resource.',
      path: '/api/v1/contact/all-messages',
    });

    expect(parsed).toMatchObject({
      errorCode: 'ERR_FORBIDDEN',
      known: true,
      message: 'You do not have permission to access this resource.',
      status: 403,
    });
  });

  it('a thrown raw 500 envelope keeps refId (status recovered from the body)', () => {
    const parsed = parseApiError({
      errorCode: 'ERR_INTERNAL_SYSTEM',
      message: 'Something went wrong.',
      refId: 'a1b2c3d4',
      status: 500,
    });

    expect(parsed.status).toBe(500);
    expect(parsed.refId).toBe('a1b2c3d4');
  });

  it('a thrown raw legacy `{ errorMessages }` body maps fields', () => {
    const parsed = parseApiError({ errorMessages: { name: 'Name is required' } });

    expect(parsed.errorCode).toBe('ERR_VALIDATION');
    expect(parsed.fields).toEqual({ name: 'Name is required' });
    expect(parsed.message).toBe('Name is required');
  });

  it('a thrown bare `{ message }` body surfaces the message', () => {
    expect(parseApiError({ message: 'Old backend note' }).message).toBe('Old backend note');
  });

  it('a real axios Error without a response is NEVER mistaken for a payload', () => {
    const parsed = parseApiError(
      Object.assign(new Error('Request failed with status code 404'), { code: 'ERR_BAD_REQUEST' })
    );

    expect(parsed.errorCode).toBe('ERR_NETWORK');
    expect(parsed.message).not.toContain('Request failed');
  });
});

describe('ApiValidationError — canonical class (EF-2 centralization)', () => {
  it('carries field errors and identifies itself for instanceof checks', () => {
    const err = new ApiValidationError('Validation failed', { name: 'Name is required' });

    expect(err).toBeInstanceOf(ApiValidationError);
    expect(err.name).toBe('ApiValidationError');
    expect(err.fieldErrors).toEqual({ name: 'Name is required' });
    expect(err.message).toBe('Validation failed');
  });
});

describe('showApiError — presentation only', () => {
  it('renders the clean message', () => {
    showApiError(axiosError(403, { errorCode: 'ERR_FORBIDDEN', message: 'Not allowed.' }));
    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith('Not allowed.');
  });

  it('appends the reference ONLY for 5xx responses that carry a refId', () => {
    showApiError(axiosError(500, { errorCode: 'ERR_INTERNAL_SYSTEM', message: 'Something went wrong.', refId: 'a1b2c3d4' }));
    expect(toastMock).toHaveBeenCalledWith('Something went wrong. (Reference: a1b2c3d4)');

    toastMock.mockClear();
    showApiError(axiosError(500, { errorCode: 'ERR_INTERNAL_SYSTEM', message: 'Something went wrong.' }));
    expect(toastMock).toHaveBeenCalledWith('Something went wrong.');

    toastMock.mockClear();
    showApiError(axiosError(400, { errorCode: 'ERR_VALIDATION', message: 'Bad input.', refId: 'x' }));
    expect(toastMock).toHaveBeenCalledWith('Bad input.');
  });

  it.each([
    ['email, firstName', 'email, firstName'],
    [JSON.stringify(['email', 'firstName']), 'email, firstName'],
  ])('shows safe ERR_UNKNOWN_FIELD diagnostics for allowedFields=%s', (allowedFields, expectedAllowed) => {
    showApiError(axiosError(400, {
      errorCode: 'ERR_UNKNOWN_FIELD',
      message: 'Backend detail that should not replace field diagnostics.',
      fields: { invalidField: 'extraProperty', allowedFields },
    }));
    expect(toastMock).toHaveBeenCalledWith(
      `Request contains an undeclared field: extraProperty. Allowed fields: ${expectedAllowed}.`,
    );
  });

  it('does not expose values when showing unknown-field diagnostics', () => {
    showApiError(axiosError(400, {
      errorCode: 'ERR_UNKNOWN_FIELD',
      fields: { invalidField: 'extraProperty', allowedFields: ['email', 'password'] },
      submittedValue: 'secret-value',
    }));
    expect(toastMock).toHaveBeenCalledWith(
      'Request contains an undeclared field: extraProperty. Allowed fields: email, password.',
    );
    expect(toastMock.mock.calls.flat().join(' ')).not.toContain('secret-value');
  });

  it('stays silent for canceled requests and session-expiry rejections (auth owns those)', () => {
    showApiError(Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' }));
    showApiError(Object.assign(new Error('Session expired'), { code: 'SESSION_EXPIRED' }));
    expect(toastMock).not.toHaveBeenCalled();
  });
});
