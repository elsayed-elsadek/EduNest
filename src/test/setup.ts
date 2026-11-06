/**
 * Global test setup — runs once per test file before the suites.
 *
 * - registers the jest-dom matchers (`toBeInTheDocument`, `toBeVisible`, …)
 *   on Vitest's `expect`;
 * - unmounts every rendered React tree so state never leaks between tests;
 * - clears browser storage so the persisted auth store starts empty.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.unstubAllEnvs();
});
