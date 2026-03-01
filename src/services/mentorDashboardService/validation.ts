/**
 * Extract errorMessages from API error response
 */
export function getValidationFieldErrors(error: unknown): Record<string, string> | null {
  const err = error as { response?: { data?: unknown }; message?: string };
  const data = err?.response?.data;
  if (data && typeof data === 'object' && data !== null && 'errorMessages' in data) {
    const messages = (data as { errorMessages?: Record<string, string> }).errorMessages;
    if (messages && typeof messages === 'object') {
      return messages;
    }
  }
  return null;
}
