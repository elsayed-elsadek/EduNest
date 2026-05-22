import api from '../api';
import type { PaymentsFullApiResponse } from '../../types/admin-role-types/admin-payment.types';

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try {
    return (await req).data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

// GET /api/v1/admin/payments/full?page=0&size=10
export const getPaymentsFull = (
  page = 0,
  size = 10,
): Promise<PaymentsFullApiResponse> =>
  handleRequest(
    api.get('api/v1/admin/payments/full', { params: { page, size } }),
  );