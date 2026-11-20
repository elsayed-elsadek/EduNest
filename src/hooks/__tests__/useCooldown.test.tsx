import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCooldown } from '../useCooldown';

describe('useCooldown', () => {
  afterEach(() => vi.useRealTimers());

  it('starts, ticks, and completes without submitting anything', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCooldown());
    act(() => result.current.start(2));
    expect(result.current).toMatchObject({ remainingSeconds: 2, isActive: true });

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remainingSeconds).toBe(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toMatchObject({ remainingSeconds: 0, isActive: false });
  });

  it('clears and replaces an active countdown', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCooldown());
    act(() => result.current.start(10));
    act(() => result.current.clear());
    expect(result.current).toMatchObject({ remainingSeconds: 0, isActive: false });

    act(() => result.current.start(3));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remainingSeconds).toBe(2);
  });
});
