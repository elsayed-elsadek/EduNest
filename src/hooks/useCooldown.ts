import { useCallback, useEffect, useRef, useState } from 'react';

/** A local countdown only; it never retries or submits a request. */
export function useCooldown() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemainingSeconds(0);
  }, []);

  const start = useCallback((seconds: number) => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    const duration = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    setRemainingSeconds(duration);
    if (duration === 0) {
      intervalRef.current = null;
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
  }, []);

  return { start, clear, remainingSeconds, isActive: remainingSeconds > 0 };
}
