import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { getPaymentsFull } from '../../services/admin-role-service/AdminPaymentService';
import type {
  LedgerRecord,
  SalesChartPoint,
  EnrollmentPaymentApi,
  SalesChartApi,
} from '../../types/admin-role-types/admin-payment.types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')

//  mappers 

function formatDate(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric',
      year:  'numeric',
    });
    const time = d.toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
    });
    return { date, time };
  } catch {
    return { date: iso, time: '' };
  }
}

function mapRecord(r: EnrollmentPaymentApi, idx: number): LedgerRecord {
  const { date, time } = formatDate(r.joinedDate);
  return {
    id:              idx,
    userName:        r.studentFullName,
    userAvatar:      r.studentProfileImageUrl
      ? `${BASE_URL}${r.studentProfileImageUrl}`
      : undefined,
    email:           r.studentEmail,
    mentorName:      r.mentorName,
    mentorshipTitle: r.mentorshipTitle,
    date,
    time,
    amount:          `$${r.price.toFixed(2)}`,
    platformProfit:  `$${r.platformProfit.toFixed(2)}`,
  };
}

function mapChart(c: SalesChartApi): SalesChartPoint {
  return {
    date:   `${c.month} ${c.year}`,
    amount: c.totalRevenue,
  };
}

//  query key 
export const PAYMENTS_KEY = (email: string, page: number, size: number) =>
  ['admin-payments', email, page, size] as const;

//  hook 
export const useFinancialOversight = (page = 0, size = 10) => {
  const userEmail = useAuthStore(s => s.userEmail) ?? '';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey:  PAYMENTS_KEY(userEmail, page, size),
    queryFn:   () => getPaymentsFull(page, size),
    staleTime: 3 * 60 * 1000,   // 3 min
    gcTime:    10 * 60 * 1000,
    enabled:   !!userEmail,
    select: (res) => {
      const d = res.apiResponse.data;
      return {
        records:       d.enrollmentPayments.content.map(mapRecord),
        totalElements: d.enrollmentPayments.totalElements,
        totalPages:    d.enrollmentPayments.totalPages,
        chartData:     d.salesChart.map(mapChart),
      };
    },
  });

  return {
    records:       data?.records       ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages:    data?.totalPages    ?? 1,
    chartData:     data?.chartData     ?? [],
    loading:       isLoading,
    isError,
    refetch,
  };
};