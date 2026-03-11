import { QueryClient } from '@tanstack/react-query';

/**
 * Query Client Configuration
 * Optimized for caching, stale time, and retry logic
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds before cached data becomes stale
      // 5 minutes - reduces unnecessary API calls
      staleTime: 5 * 60 * 1000,
      
      // Time in milliseconds that unused/inactive cached data remains in memory
      // 10 minutes - keeps data available for quick re-navigation
      gcTime: 10 * 60 * 1000,
      
      // Number of retry attempts on failure
      retry: 2,
      
      // Delay between retries (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus for stale data (reduces API calls)
      refetchOnWindowFocus: false,
      
      // Don't refetch when reconnecting (saves bandwidth)
      refetchOnReconnect: false,
      
      // Keep previous render while fetching (better UX)
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations on failure
      retry: 1,
    },
  },
});

// Query keys factory for consistent cache management
export const queryKeys = {
  // Mentorships
  mentorships: ['mentorships'] as const,
  mentorship: (id: string) => ['mentorship', id] as const,
  mentorshipStats: (id: string) => ['mentorship', id, 'stats'] as const,
  
  // Dashboard
  dashboard: ['dashboard'] as const,
  dashboardCards: ['dashboard', 'cards'] as const,
  
  // Students
  students: (page?: number, size?: number) => ['students', page, size] as const,
  
  // Notifications
  notifications: (page?: number) => ['notifications', page] as const,
  
  // Reviews
  reviews: (mentorshipId: string) => ['reviews', mentorshipId] as const,
  
  // Sessions
  sessions: ['sessions'] as const,
  
  // Top Learners
  topLearners: (mentorshipId: string) => ['top-learners', mentorshipId] as const,
} as const;

