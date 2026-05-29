const getFirstErrorMessage = (errorMessages: Record<string, unknown>): string | null => {
  const values = Object.values(errorMessages);
  if (!values.length) return null;

  const firstValue = values[0];
  if (typeof firstValue === 'string') return firstValue;
  if (typeof firstValue === 'object' && firstValue !== null) {
    return JSON.stringify(firstValue);
  }

  return null;
};

const parseMessageFromObject = (data: Record<string, unknown>): string | null => {
  if (data.errorMessages && typeof data.errorMessages === 'object') {
    const message = getFirstErrorMessage(data.errorMessages as Record<string, unknown>);
    if (message) return message;
  }

  if (data.apiResponse && typeof data.apiResponse === 'object') {
    const apiMessage = (data.apiResponse as { message?: unknown }).message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  return null;
};

export const getBackendErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong'
): string => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) {
    return error.message || fallback;
  }

  const err = error as { response?: { data?: unknown } };
  const data = err.response?.data ?? error;

  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const message = parseMessageFromObject(data as Record<string, unknown>);
    if (message) return message;
  }

  return fallback;
};

export const getResponseMessage = (data: unknown, fallback: string): string => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const message = parseMessageFromObject(data as Record<string, unknown>);
    if (message) return message;
  }
  return fallback;
};
