import { useEffect, useState } from 'react';

/**
 * Global connectivity banner. Shown while the browser reports no connection;
 * disappears as soon as it comes back online — react-query's
 * `refetchOnReconnect: true` then refreshes the stale queries automatically,
 * so the UI recovers without a manual reload.
 */
const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(
    () => typeof navigator !== 'undefined' && !navigator.onLine,
  );

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      className="w-full bg-amber-100 border-b border-amber-300 text-amber-900 text-sm px-4 py-2 text-center font-medium"
    >
      You&apos;re offline. Some features may be unavailable — everything will refresh automatically once you&apos;re
      back online.
    </div>
  );
};

export default OfflineBanner;
