import React from 'react';
import { reportError } from '../../utils/errorReporting';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback; the default one offers Reload + Go home. */
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Route-level error boundary: a render error in a page shows a recoverable
 * fallback instead of blanking the whole app. Mounted around `<Routes>` in
 * `App.tsx` (so the navbar/sidebar shell stays usable) and around `<App />` in
 * `main.tsx` as the last-resort global fallback.
 *
 * Buttons intentionally use `window.location` — the boundary may fire while
 * the router context itself is broken, so we must not depend on `useNavigate`.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    reportError(error, { componentStack: info.componentStack ?? undefined });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center px-4 py-10">
          <div className="text-center max-w-md w-full p-8 bg-white border border-red-200 rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Something went wrong</h2>
            <p className="mt-1 text-sm text-gray-500">
              An unexpected error occurred while rendering this page. Your data is safe — you can retry or go back to
              the home page.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--primary-500)' }}
              >
                Reload page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[var(--primary-500)] border border-[var(--primary-500)] transition hover:bg-[var(--primary-50)]"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
