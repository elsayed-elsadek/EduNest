export const MENTOR_DASHBOARD_BASE = 'api/v1/dashboard';

export const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};
