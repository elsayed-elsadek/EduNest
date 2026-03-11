
import { useEffect, useRef } from 'react';

interface UseMarkReadOnViewOptions {
  id:         string;
  isRead:     boolean;
  onMarkRead: (id: string) => void;
  delay?:     number;
}

export const useMarkReadOnView = ({
  id,
  isRead,
  onMarkRead,
  delay = 3000,
}: UseMarkReadOnViewOptions) => {
  const ref        = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ← store latest callback in ref so effect doesn't re-run on every render
  const callbackRef = useRef(onMarkRead);
  useEffect(() => { callbackRef.current = onMarkRead; });

  useEffect(() => {
    if (isRead) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timerRef.current = setTimeout(() => {
            callbackRef.current(id);
          }, delay);
        } else {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, isRead, delay]); 

  return ref;
};