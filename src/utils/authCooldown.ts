import { parseApiError, type NormalizedApiError } from '../services/errors';

export function getCooldownMessage(error: NormalizedApiError, seconds: number): string {
  return formatCooldownMessage(error.errorCode, seconds);
}

export function formatCooldownMessage(errorCode: string, seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  const time = `${minutes}:${String(remainder).padStart(2, '0')}`;
  if (errorCode === 'ERR_ACCOUNT_LOCKED') {
    return `Account temporarily locked. Try again in ${time}.`;
  }
  return `You can try again in ${time}`;
}

export function startCooldownFromError(
  error: unknown,
  start: (seconds: number) => void,
): NormalizedApiError {
  const normalized = parseApiError(error);
  if (
    normalized.status === 429 &&
    (normalized.errorCode === 'ERR_RATE_LIMITED' || normalized.errorCode === 'ERR_ACCOUNT_LOCKED')
  ) {
    start(normalized.retryAfterSeconds ?? (normalized.errorCode === 'ERR_RATE_LIMITED' ? 60 : 300));
  }
  return normalized;
}
